const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const { randomUUID } = require("crypto");
const Database = require("better-sqlite3");
const XLSX = require("xlsx");
const { Telegraf } = require("telegraf");
const { ethers } = require("ethers");
const cheerio = require("cheerio");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const CONFIG = {
  port: Number(process.env.PORT || 3010),
  depositWalletAddress: (process.env.DEPOSIT_WALLET_ADDRESS || process.env.MONITORED_ADDRESS || "0xc2b65f40b8361F9eCf27FB03F2ce3992D1F0211c").toLowerCase(),
  withdrawalWalletAddress: (process.env.WITHDRAWAL_WALLET_ADDRESS || process.env.MONITORED_ADDRESS || "0x876F2A2EfE1B20E38018c8292823d814bf195216").toLowerCase(),
  usdtContract: (process.env.USDT_CONTRACT || "0x55d398326f99059fF775485246999027B3197955").toLowerCase(),
  bscApiKey: process.env.BSCSCAN_API_KEY || "",
  bscApiBase: process.env.BSCSCAN_API_BASE || "https://api.bscscan.com/api",
  rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.bnbchain.org",
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 45000),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  matchWindowMinutes: Number(process.env.MATCH_WINDOW_MINUTES || 5),
  amountTolerance: Number(process.env.AMOUNT_TOLERANCE || 1),
  initialBackfillHours: Number(process.env.INITIAL_BACKFILL_HOURS || 24),
  minTransactionAmount: Number(process.env.MIN_TRANSACTION_AMOUNT || 1),
};

const STORE_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(STORE_DIR, "checker.sqlite");
const LEGACY_STORE_FILE = path.join(STORE_DIR, "store.json");
const MANUAL_RECONCILIATIONS_KEY = "manual_reconciliations";

function createWalletSyncState() {
  return {
    trackedAddress: null,
    lastCheckedAt: null,
    lastBlock: 0,
    lastError: null,
    lastSource: null,
    baselineTimestamp: null,
    initialized: false,
    lastMode: null,
    lastFullSyncAt: null,
    lastIncrementalSyncAt: null,
  };
}

function defaultStore() {
  return {
    transactions: [],
    telegramMessages: [],
    manualReconciliations: [],
    sync: {
      wallets: {
        deposit: createWalletSyncState(),
        withdrawal: createWalletSyncState(),
      },
      telegram: {
        trackedAddress: null,
        lastCheckedAt: null,
        lastError: null,
        lastMode: "live-only",
        lastMessageAt: null,
        historicalImportSupported: false,
        importCursors: {},
      },
    },
  };
}

let db;
let feeProvider;
const ERC20_TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const ERC20_TRANSFER_SELECTOR = "0xa9059cbb";
const ERC20_BALANCE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];
const WALLET_CONFIGS = {
  deposit: {
    key: "deposit",
    label: "Deposit wallet",
    address: CONFIG.depositWalletAddress,
  },
  withdrawal: {
    key: "withdrawal",
    label: "Withdrawal wallet",
    address: CONFIG.withdrawalWalletAddress,
  },
};

function buildTransactionKey(tx) {
  const walletAddress = String(tx.walletAddress || "").toLowerCase();
  const hash = String(tx.hash || "").toLowerCase();
  const logIndex = tx.raw?.logIndex ?? tx.logIndex;
  if (logIndex != null && logIndex !== "") {
    return `${walletAddress}:${hash}:${logIndex}`;
  }
  return [
    walletAddress,
    hash,
    String(tx.from || "").toLowerCase(),
    String(tx.to || "").toLowerCase(),
    Number(tx.amount || 0).toFixed(8),
    String(tx.timestamp || ""),
  ].join(":");
}

function getWalletAddress(key) {
  return WALLET_CONFIGS[key]?.address || "";
}

function ensureWalletSyncState(sync, walletKey) {
  sync.wallets ||= {};
  sync.wallets[walletKey] = {
    ...createWalletSyncState(),
    ...(sync.wallets[walletKey] || {}),
  };
  return sync.wallets[walletKey];
}

function getRpcProvider() {
  if (!feeProvider) {
    feeProvider = new ethers.JsonRpcProvider(CONFIG.rpcUrl, 56, { staticNetwork: true });
  }
  return feeProvider;
}

async function getWalletSnapshot(address, label) {
  const provider = getRpcProvider();
  const tokenContract = new ethers.Contract(CONFIG.usdtContract, ERC20_BALANCE_ABI, provider);
  const [nativeBalance, tokenBalance, transactionCount, latestBlock] = await Promise.all([
    provider.getBalance(address),
    tokenContract.balanceOf(address),
    provider.getTransactionCount(address),
    provider.getBlockNumber(),
  ]);

  return {
    label,
    address,
    network: "BNB Smart Chain",
    bscscanAddressUrl: `https://bscscan.com/address/${address}`,
    bscscanTokenUrl: `https://bscscan.com/token/${CONFIG.usdtContract}?a=${address}`,
    nativeSymbol: "BNB",
    tokenSymbol: "USDT",
    nativeBalance: Number(ethers.formatEther(nativeBalance)),
    tokenBalance: Number(ethers.formatUnits(tokenBalance, 18)),
    transactionCount,
    latestBlock,
    updatedAt: new Date().toISOString(),
    error: null,
  };
}

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }

  if (!db) {
    db = new Database(DB_FILE);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS sync_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transactions (
        tx_key TEXT PRIMARY KEY,
        hash TEXT,
        wallet_address TEXT,
        block_number INTEGER,
        sender TEXT,
        recipient TEXT,
        token_symbol TEXT,
        token_name TEXT,
        contract_address TEXT,
        amount REAL,
        timestamp TEXT,
        raw_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS telegram_messages (
        id TEXT PRIMARY KEY,
        tx_hash TEXT,
        fees_tx_hash TEXT,
        message_id INTEGER,
        chat_id TEXT,
        sender TEXT,
        amount REAL,
        timestamp TEXT,
        text TEXT,
        raw_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_telegram_messages_tx_hash ON telegram_messages(tx_hash);
      CREATE INDEX IF NOT EXISTS idx_telegram_messages_fees_tx_hash ON telegram_messages(fees_tx_hash);
      CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_message ON telegram_messages(chat_id, message_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);
      CREATE INDEX IF NOT EXISTS idx_telegram_messages_timestamp ON telegram_messages(timestamp);
    `);
    const transactionColumns = db.prepare("PRAGMA table_info(transactions)").all().map((column) => column.name);
    if (!transactionColumns.includes("tx_key")) {
      db.exec(`
        DROP TABLE IF EXISTS transactions_v2;
        CREATE TABLE transactions_v2 (
          tx_key TEXT PRIMARY KEY,
          hash TEXT,
          wallet_address TEXT,
          block_number INTEGER,
          sender TEXT,
          recipient TEXT,
          token_symbol TEXT,
          token_name TEXT,
          contract_address TEXT,
          amount REAL,
          timestamp TEXT,
          raw_json TEXT NOT NULL
        );
        INSERT OR REPLACE INTO transactions_v2 (
          tx_key, hash, wallet_address, block_number, sender, recipient, token_symbol,
          token_name, contract_address, amount, timestamp, raw_json
        )
        SELECT
          COALESCE(wallet_address, '') || ':' || COALESCE(hash, '') || ':' || COALESCE(sender, '') || ':' || COALESCE(recipient, '') || ':' || printf('%.8f', COALESCE(amount, 0)) || ':' || COALESCE(timestamp, ''),
          hash, wallet_address, block_number, sender, recipient, token_symbol,
          token_name, contract_address, amount, timestamp, raw_json
        FROM transactions;
        DROP TABLE transactions;
        ALTER TABLE transactions_v2 RENAME TO transactions;
        CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
        CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);
      `);
    } else if (!transactionColumns.includes("wallet_address")) {
      db.prepare("ALTER TABLE transactions ADD COLUMN wallet_address TEXT").run();
    }
  }
}

function readStore() {
  ensureStore();
  const syncRow = db.prepare("SELECT value FROM sync_state WHERE key = ?").get("store");
  const manualReconciliationsRow = db.prepare("SELECT value FROM sync_state WHERE key = ?").get(MANUAL_RECONCILIATIONS_KEY);
  const store = defaultStore();
  if (syncRow?.value) {
    const parsed = JSON.parse(syncRow.value);
    store.sync = {
      wallets: {
        deposit: { ...store.sync.wallets.deposit, ...(parsed.wallets?.deposit || parsed.wallet || {}) },
        withdrawal: { ...store.sync.wallets.withdrawal, ...(parsed.wallets?.withdrawal || {}) },
      },
      telegram: { ...store.sync.telegram, ...(parsed.telegram || {}) },
    };
  }
  if (manualReconciliationsRow?.value) {
    store.manualReconciliations = JSON.parse(manualReconciliationsRow.value) || [];
  }
  const depositSync = ensureWalletSyncState(store.sync, "deposit");
  const withdrawalSync = ensureWalletSyncState(store.sync, "withdrawal");
  const walletTrackedAddress = String(depositSync.trackedAddress || "").toLowerCase();
  const withdrawalTrackedAddress = String(withdrawalSync.trackedAddress || "").toLowerCase();
  const telegramTrackedAddress = String(store.sync.telegram.trackedAddress || "").toLowerCase();
  if (
    (walletTrackedAddress && walletTrackedAddress !== CONFIG.depositWalletAddress)
    || (withdrawalTrackedAddress && withdrawalTrackedAddress !== CONFIG.withdrawalWalletAddress)
    || (telegramTrackedAddress && telegramTrackedAddress !== CONFIG.depositWalletAddress)
  ) {
    store.sync.wallets.deposit = {
      ...createWalletSyncState(),
      trackedAddress: CONFIG.depositWalletAddress,
    };
    store.sync.wallets.withdrawal = {
      ...createWalletSyncState(),
      trackedAddress: CONFIG.withdrawalWalletAddress,
    };
    store.sync.telegram = {
      ...defaultStore().sync.telegram,
      trackedAddress: CONFIG.depositWalletAddress,
    };
  }

  store.sync.wallets.deposit.trackedAddress = CONFIG.depositWalletAddress;
  store.sync.wallets.withdrawal.trackedAddress = CONFIG.withdrawalWalletAddress;
  store.sync.telegram.trackedAddress = CONFIG.depositWalletAddress;
  store.sync.telegram.importCursors ||= {};

  store.transactions = db.prepare(`
    SELECT
      tx_key AS txKey,
      hash,
      wallet_address AS walletAddress,
      block_number AS blockNumber,
      sender AS "from",
      recipient AS "to",
      token_symbol AS tokenSymbol,
      token_name AS tokenName,
      contract_address AS contractAddress,
      amount,
      timestamp,
      raw_json AS rawJson
    FROM transactions
    ORDER BY datetime(timestamp) DESC, block_number DESC
  `).all().map((row) => ({
    ...row,
    raw: JSON.parse(row.rawJson || "{}"),
  })).map(({ rawJson, ...row }) => row)
    .map((row) => ({
      ...row,
      txKey: row.txKey || buildTransactionKey(row),
    }))
    .filter((row) => isTrackedUsdtTransaction(row));

  const rawMessages = db.prepare(`
    SELECT
      id,
      message_id AS messageId,
      chat_id AS chatId,
      sender,
      amount,
      timestamp,
      text,
      raw_json AS rawJson
    FROM telegram_messages
    ORDER BY datetime(timestamp) DESC, id DESC
  `).all().map((row) => ({
    ...row,
    raw: JSON.parse(row.rawJson || "{}"),
  })).map(({ rawJson, ...row }) => row)
    .filter((row) => messageReferencesCurrentWallet(row.text) || messageReferencesCurrentWallet(row.raw?.html));

  store.telegramMessages = rawMessages.reduce((messages, rawMessage) => {
    const normalized = normalizeImportedTelegramMessage(rawMessage);
    const tempStore = { telegramMessages: messages };
    upsertTelegramMessage(tempStore, normalized);
    return tempStore.telegramMessages;
  }, []);
  return store;
}

function writeStore(store) {
  ensureStore();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM transactions").run();
    db.prepare("DELETE FROM telegram_messages").run();

    const insertTransaction = db.prepare(`
      INSERT INTO transactions (
        tx_key, hash, wallet_address, block_number, sender, recipient, token_symbol, token_name,
        contract_address, amount, timestamp, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of store.transactions || []) {
      insertTransaction.run(
        row.txKey || buildTransactionKey(row),
        row.hash,
        row.walletAddress || null,
        row.blockNumber ?? null,
        row.from || null,
        row.to || null,
        row.tokenSymbol || null,
        row.tokenName || null,
        row.contractAddress || null,
        row.amount ?? null,
        row.timestamp || null,
        JSON.stringify(row.raw || {})
      );
    }

    const insertMessage = db.prepare(`
      INSERT INTO telegram_messages (
        id, tx_hash, fees_tx_hash, message_id, chat_id, sender, amount, timestamp, text, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of store.telegramMessages || []) {
      insertMessage.run(
        row.id,
        row.raw?.txHash || null,
        row.raw?.feesTxHash || null,
        row.messageId ?? null,
        row.chatId || null,
        row.sender || null,
        row.amount ?? null,
        row.timestamp || null,
        row.text || null,
        JSON.stringify(row.raw || {})
      );
    }

    db.prepare(`
      INSERT INTO sync_state (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run("store", JSON.stringify(store.sync || defaultStore().sync));
    db.prepare(`
      INSERT INTO sync_state (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(MANUAL_RECONCILIATIONS_KEY, JSON.stringify(store.manualReconciliations || []));
  });

  tx();
}

function amountFromRaw(value, decimals) {
  const divisor = 10 ** Number(decimals || 18);
  return Number(value) / divisor;
}

function normalizeTransaction(tx, walletAddress) {
  const normalized = {
    id: tx.hash,
    hash: tx.hash,
    walletAddress,
    blockNumber: Number(tx.blockNumber),
    from: String(tx.from || "").toLowerCase(),
    to: String(tx.to || "").toLowerCase(),
    tokenSymbol: tx.tokenSymbol,
    tokenName: tx.tokenName,
    contractAddress: String(tx.contractAddress || "").toLowerCase(),
    amount: amountFromRaw(tx.value, tx.tokenDecimal),
    timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
    raw: {
      ...tx,
      walletAddress,
    },
  };
  normalized.txKey = buildTransactionKey(normalized);
  return normalized;
}

function normalizeRpcTransaction(log, timestamp, walletAddress) {
  const from = ethers.getAddress(ethers.dataSlice(log.topics[1], 12)).toLowerCase();
  const to = ethers.getAddress(ethers.dataSlice(log.topics[2], 12)).toLowerCase();

  const normalized = {
    id: log.transactionHash,
    hash: log.transactionHash,
    walletAddress,
    blockNumber: Number(log.blockNumber),
    from,
    to,
    tokenSymbol: "USDT",
    tokenName: "Tether USD",
    contractAddress: log.address.toLowerCase(),
    amount: Number(ethers.formatUnits(log.data, 18)),
    timestamp,
    raw: {
      walletAddress,
      logIndex: log.index,
      removed: log.removed,
      transactionIndex: log.transactionIndex,
    },
  };
  normalized.txKey = buildTransactionKey(normalized);
  return normalized;
}

function isTrackedUsdtTransaction(tx) {
  return (
    [CONFIG.depositWalletAddress, CONFIG.withdrawalWalletAddress].includes(String(tx.walletAddress || "").toLowerCase())
    && String(tx.contractAddress || "").toLowerCase() === CONFIG.usdtContract
  );
}

function extractAmount(text) {
  if (!text) {
    return null;
  }

  const patterns = [
    /(?:usdt|usd|amount|received|payment)[^\d]{0,10}(\d+(?:[.,]\d{1,6})?)/i,
    /(\d+(?:[.,]\d{1,6})?)\s*(?:usdt|usd)/i,
    /(?:rs|inr)[^\d]{0,10}(\d+(?:[.,]\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return Number(match[1].replace(/,/g, ""));
    }
  }

  return null;
}

function normalizeTelegramMessage(message) {
  const text = message.text || message.caption || "";
  const buttonLabels = extractTelegramButtonLabels(message);
  const hasViewTxButton = buttonLabels.includes("View Tx");
  const hasViewFeesTxButton = buttonLabels.includes("View Fees Tx");
  const txHash = extractLabeledHash(text, "Transaction Hash") || extractHash(text);
  const feesTxHash = extractLabeledHash(text, "Fees");
  return {
    id: String(message.message_id || randomUUID()),
    messageId: message.message_id || null,
    chatId: String(message.chat?.id || ""),
    sender: [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ").trim() || message.from?.username || "unknown",
    text,
    amount: extractAmount(text),
    timestamp: new Date((message.date || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    raw: {
      ...message,
      txHash,
      feesTxHash,
      buttonLabels,
      hasViewTxButton,
      hasViewFeesTxButton,
    },
  };
}

function normalizeImportedTelegramMessage(message) {
  const text = message.text || "";
  const raw = message.raw || {};
  const buttonLabels = Array.isArray(raw.buttonLabels) ? raw.buttonLabels : [];
  const txHash = raw.txHash || extractLabeledHash(text, "Transaction Hash") || extractHash(text);
  const feesTxHash = raw.feesTxHash || extractLabeledHash(text, "Fees");
  return {
    id: message.id,
    messageId: message.messageId,
    chatId: message.chatId || "telegram-export",
    sender: message.sender || "unknown",
    text,
    amount: message.amount ?? extractAmount(text),
    timestamp: message.timestamp,
    raw: {
      ...raw,
      txHash,
      feesTxHash,
      allHashes: raw.allHashes || extractHashes(text),
      buttonLabels,
      hasViewTxButton: raw.hasViewTxButton ?? buttonLabels.includes("View Tx"),
      hasViewFeesTxButton: raw.hasViewFeesTxButton ?? buttonLabels.includes("View Fees Tx"),
    },
  };
}

function findTelegramMessageIndex(store, message) {
  const txHash = message?.raw?.txHash || null;
  if (txHash) {
    const byTxHash = store.telegramMessages.findIndex((msg) => msg?.raw?.txHash === txHash);
    if (byTxHash >= 0) {
      return byTxHash;
    }
  }

  const feesTxHash = message?.raw?.feesTxHash || null;
  if (feesTxHash) {
    const byFeesTxHash = store.telegramMessages.findIndex((msg) => msg?.raw?.feesTxHash === feesTxHash);
    if (byFeesTxHash >= 0) {
      return byFeesTxHash;
    }
  }

  if (message?.chatId && message?.messageId != null) {
    return store.telegramMessages.findIndex(
      (msg) => msg.chatId === message.chatId && msg.messageId === message.messageId
    );
  }

  return store.telegramMessages.findIndex((msg) => msg.id === message.id);
}

function mergeTelegramMessage(existing, incoming) {
  return normalizeImportedTelegramMessage({
    ...existing,
    ...incoming,
    id: existing.id || incoming.id,
    messageId: incoming.messageId ?? existing.messageId,
    chatId: incoming.chatId || existing.chatId,
    sender: incoming.sender || existing.sender,
    text: incoming.text || existing.text,
    amount: incoming.amount ?? existing.amount,
    timestamp: incoming.timestamp || existing.timestamp,
    raw: {
      ...(existing.raw || {}),
      ...(incoming.raw || {}),
      buttonLabels: (incoming.raw?.buttonLabels?.length ? incoming.raw.buttonLabels : existing.raw?.buttonLabels) || [],
      hasViewTxButton: incoming.raw?.hasViewTxButton ?? existing.raw?.hasViewTxButton ?? false,
      hasViewFeesTxButton: incoming.raw?.hasViewFeesTxButton ?? existing.raw?.hasViewFeesTxButton ?? false,
      txHash: incoming.raw?.txHash || existing.raw?.txHash || null,
      feesTxHash: incoming.raw?.feesTxHash || existing.raw?.feesTxHash || null,
      allHashes: incoming.raw?.allHashes || existing.raw?.allHashes || [],
    },
  });
}

function upsertTelegramMessage(store, message) {
  const existingIndex = findTelegramMessageIndex(store, message);
  if (existingIndex >= 0) {
    store.telegramMessages[existingIndex] = mergeTelegramMessage(store.telegramMessages[existingIndex], message);
    return false;
  }

  store.telegramMessages.push(message);
  return true;
}

function normalizeCursorChatKey(chatId) {
  return String(chatId || "telegram-export");
}

function getTelegramImportCursor(store, chatId) {
  const key = normalizeCursorChatKey(chatId);
  return store.sync?.telegram?.importCursors?.[key] || null;
}

function updateTelegramImportCursor(store, message) {
  store.sync.telegram.importCursors ||= {};
  const key = normalizeCursorChatKey(message.chatId);
  const existing = store.sync.telegram.importCursors[key] || {};
  const existingTime = existing.latestTimestamp ? new Date(existing.latestTimestamp).getTime() : 0;
  const messageTime = message.timestamp ? new Date(message.timestamp).getTime() : 0;

  if (messageTime >= existingTime) {
    store.sync.telegram.importCursors[key] = {
      latestTimestamp: message.timestamp || existing.latestTimestamp || null,
      latestTxHash: message.raw?.txHash || existing.latestTxHash || null,
      latestMessageId: message.messageId ?? existing.latestMessageId ?? null,
      updatedAt: new Date().toISOString(),
    };
  }
}

function shouldSkipImportedTelegramMessage(store, message) {
  const cursor = getTelegramImportCursor(store, message.chatId);
  if (!cursor?.latestTimestamp) {
    return false;
  }

  const cursorTime = new Date(cursor.latestTimestamp).getTime();
  const messageTime = message.timestamp ? new Date(message.timestamp).getTime() : 0;
  if (messageTime > cursorTime) {
    return false;
  }

  if (message.raw?.txHash) {
    return findTelegramMessageIndex(store, message) >= 0;
  }

  if (message.messageId != null) {
    return messageTime <= cursorTime;
  }

  return false;
}

function decodeTransferLogAmount(log, decimals = 18) {
  return Number(ethers.formatUnits(log.data, decimals));
}

async function resolveFeeTransfer(feesTxHash) {
  const provider = getRpcProvider();
  const tx = await provider.getTransaction(feesTxHash);
  const receipt = await provider.getTransactionReceipt(feesTxHash);
  if (!tx || !receipt) {
    return null;
  }

  const transferLogs = receipt.logs.filter((log) => log.topics?.[0] === ERC20_TRANSFER_TOPIC);
  const preferredLog = transferLogs.find((log) => String(log.address || "").toLowerCase() === CONFIG.usdtContract)
    || transferLogs[0];

  if (preferredLog) {
    const contractAddress = String(preferredLog.address || "").toLowerCase();
    const currency = contractAddress === CONFIG.usdtContract ? "USDT" : contractAddress;
    const decimals = contractAddress === CONFIG.usdtContract ? 18 : 18;
    return {
      amount: decodeTransferLogAmount(preferredLog, decimals),
      currency,
      contractAddress,
    };
  }

  if (tx.data?.startsWith(ERC20_TRANSFER_SELECTOR) && String(tx.to || "").toLowerCase() === CONFIG.usdtContract) {
    const encodedValue = `0x${tx.data.slice(74, 138)}`;
    return {
      amount: Number(ethers.formatUnits(encodedValue, 18)),
      currency: "USDT",
      contractAddress: CONFIG.usdtContract,
    };
  }

  if (tx.value && tx.value > 0n) {
    return {
      amount: Number(ethers.formatEther(tx.value)),
      currency: "BNB",
      contractAddress: null,
    };
  }

  return null;
}

async function enrichTelegramFees(store) {
  const targets = store.telegramMessages.filter(
    (msg) =>
      isQualifyingTelegramMessage(msg) &&
      msg.raw?.feesTxHash &&
      msg.raw?.feesAmount == null
  );

  if (!targets.length) {
    return store;
  }

  const cache = new Map();
  const concurrency = 8;
  let updated = false;

  for (let index = 0; index < targets.length; index += concurrency) {
    const batch = targets.slice(index, index + concurrency);
    await Promise.all(batch.map(async (message) => {
      const feesTxHash = message.raw?.feesTxHash;
      if (!feesTxHash) {
        return;
      }

      try {
        let feeDetails = cache.get(feesTxHash);
        if (feeDetails === undefined) {
          feeDetails = await resolveFeeTransfer(feesTxHash);
          cache.set(feesTxHash, feeDetails);
        }
        if (feeDetails != null) {
          message.raw.feesAmount = feeDetails.amount;
          message.raw.feesCurrency = feeDetails.currency;
          message.raw.feesContractAddress = feeDetails.contractAddress;
          updated = true;
        }
      } catch (error) {
        message.raw.feesResolveError = error.message;
      }
    }));
  }

  if (updated) {
    writeStore(store);
  }

  return store;
}

function isPrimaryTelegramMessage(message) {
  return Boolean(
    message?.raw?.hasViewTxButton &&
    !message?.raw?.hasViewFeesTxButton &&
    Number(message?.amount || 0) >= CONFIG.minTransactionAmount
  );
}

function isSettlementTelegramMessage(message) {
  return Boolean(
    message?.raw?.hasViewTxButton &&
    message?.raw?.hasViewFeesTxButton &&
    Number(message?.amount || 0) >= CONFIG.minTransactionAmount
  );
}

function isQualifyingTelegramMessage(message) {
  return isPrimaryTelegramMessage(message) || isSettlementTelegramMessage(message);
}

function findSettlementMessage(message, settlementMessages, settlementByHash, windowMs) {
  if (!isPrimaryTelegramMessage(message)) {
    return isSettlementTelegramMessage(message) ? message : null;
  }

  if (message.raw?.txHash && settlementByHash.has(message.raw.txHash)) {
    return settlementByHash.get(message.raw.txHash);
  }

  const messageTime = new Date(message.timestamp).getTime();
  return settlementMessages.find((candidate) => {
    if (candidate.amount == null || message.amount == null) {
      return false;
    }

    const candidateTime = new Date(candidate.timestamp).getTime();
    const withinAmount = Math.abs(Number(candidate.amount) - Number(message.amount)) <= CONFIG.amountTolerance;
    const isLater = candidateTime >= messageTime;
    const withinTime = Math.abs(candidateTime - messageTime) <= windowMs;
    return withinAmount && isLater && withinTime;
  }) || null;
}

function reconcile(store) {
  const windowMs = CONFIG.matchWindowMinutes * 60 * 1000;
  const transactions = [...store.transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const allMessages = [...store.telegramMessages]
    .filter((msg) => isQualifyingTelegramMessage(msg))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const settlementMessages = allMessages.filter((msg) => isSettlementTelegramMessage(msg));
  const primaryMessages = allMessages.some((msg) => isPrimaryTelegramMessage(msg))
    ? allMessages.filter((msg) => isPrimaryTelegramMessage(msg))
    : settlementMessages;
  const usedTransactionHashes = new Set();
  const settlementByHash = new Map();

  for (const msg of settlementMessages) {
    if (msg.raw?.txHash && !settlementByHash.has(msg.raw.txHash)) {
      settlementByHash.set(msg.raw.txHash, msg);
    }
  }

  const reconciledMessages = primaryMessages.map((msg) => {
    const settlementMessage = findSettlementMessage(msg, settlementMessages, settlementByHash, windowMs);
    const effectiveMessage = settlementMessage || msg;
    const effectiveTime = new Date(effectiveMessage.timestamp).getTime();
    const directHashMatch = effectiveMessage.raw?.txHash
      ? transactions.find((tx) => !usedTransactionHashes.has(tx.hash) && tx.hash === effectiveMessage.raw.txHash)
      : null;
    const match = directHashMatch || transactions.find((tx) => {
      if (usedTransactionHashes.has(tx.hash)) {
        return false;
      }
      if (effectiveMessage.amount == null || tx.amount == null) {
        return false;
      }
      const withinAmount = Math.abs(tx.amount - effectiveMessage.amount) <= CONFIG.amountTolerance;
      const withinTime = Math.abs(new Date(tx.timestamp).getTime() - effectiveTime) <= windowMs;
      return withinAmount && withinTime;
    });

    if (match) {
      usedTransactionHashes.add(match.hash);
    }

    return {
      ...msg,
      reconciliation: {
        status: match ? "matched" : "unmatched",
        linkedSettlementMessageId: settlementMessage?.id || null,
        linkedSettlementTimestamp: settlementMessage?.timestamp || null,
        linkedSettlementAmount: settlementMessage?.amount ?? null,
        originTxHash: msg?.raw?.txHash || null,
        originTxUrl: msg?.raw?.txHash ? `https://bscscan.com/tx/${msg.raw.txHash}` : null,
        settlementTxHash: effectiveMessage?.raw?.txHash || null,
        settlementTxUrl: effectiveMessage?.raw?.txHash ? `https://bscscan.com/tx/${effectiveMessage.raw.txHash}` : null,
        feesTxHash: effectiveMessage?.raw?.feesTxHash || null,
        feesTxUrl: effectiveMessage?.raw?.feesTxHash ? `https://bscscan.com/tx/${effectiveMessage.raw.feesTxHash}` : null,
        feesAmount: effectiveMessage?.raw?.feesAmount ?? null,
        feesCurrency: effectiveMessage?.raw?.feesCurrency || null,
        matchedTransactionHash: match?.hash || null,
        matchedTransactionAmount: match?.amount ?? null,
        matchedTransactionTimestamp: match?.timestamp || null,
        matchedTransactionFrom: match?.from || null,
        landedInWallet: Boolean(match),
        txHash: effectiveMessage?.raw?.txHash || null,
        txUrl: effectiveMessage?.raw?.txHash ? `https://bscscan.com/tx/${effectiveMessage.raw.txHash}` : null,
      },
    };
  });

  const matchedTransactionHashes = new Set(
    reconciledMessages
      .map((msg) => msg.reconciliation.matchedTransactionHash)
      .filter(Boolean)
  );

  const reconciledTransactions = transactions.map((tx) => {
    const matchedMessage = reconciledMessages.find((msg) => msg.reconciliation.matchedTransactionHash === tx.hash);
    return {
      ...tx,
      reconciliation: {
        status: matchedTransactionHashes.has(tx.hash) ? "matched" : "unmatched",
        matchedMessageId: matchedMessage?.id || null,
        matchedMessageText: matchedMessage?.text || null,
        matchedMessageAmount: matchedMessage?.amount ?? null,
        matchedMessageTimestamp: matchedMessage?.timestamp || null,
      },
    };
  });

  applyManualReconciliations(store, reconciledTransactions, reconciledMessages);

  return {
    transactions: reconciledTransactions,
    telegramMessages: reconciledMessages,
  };
}

function getMessageNetAmount(message) {
  const amount = Number(message?.amount || 0);
  const feeAmount = Number(message?.raw?.feesAmount || 0);
  return Number((amount - feeAmount).toFixed(8));
}

function applyManualReconciliations(store, reconciledTransactions, reconciledMessages) {
  const reconciliations = Array.isArray(store.manualReconciliations) ? store.manualReconciliations : [];
  if (!reconciliations.length) {
    return;
  }

  const transactionsByHash = new Map(reconciledTransactions.map((tx) => [tx.hash, tx]));
  const messagesById = new Map(reconciledMessages.map((msg) => [msg.id, msg]));

  for (const override of reconciliations) {
    const tx = transactionsByHash.get(override.walletHash);
    if (!tx) {
      continue;
    }

    const messages = (override.telegramMessageIds || [])
      .map((id) => messagesById.get(id))
      .filter(Boolean);
    if (!messages.length) {
      continue;
    }

    const grossAmount = messages.reduce((sum, msg) => sum + Number(msg.amount || 0), 0);
    const netAmount = messages.reduce((sum, msg) => sum + getMessageNetAmount(msg), 0);
    const latestMessageTimestamp = messages
      .map((msg) => msg.timestamp)
      .filter(Boolean)
      .sort()
      .at(-1) || null;
    const summaryText = override.note || `Manual batch match (${messages.length} Telegram messages)`;

    tx.reconciliation = {
      ...tx.reconciliation,
      status: "matched",
      matchedMessageId: override.id || "manual-batch",
      matchedMessageText: summaryText,
      matchedMessageAmount: Number(grossAmount.toFixed(8)),
      matchedMessageTimestamp: latestMessageTimestamp,
      manualBatch: true,
      manualBatchMessageCount: messages.length,
      manualBatchNetAmount: Number(netAmount.toFixed(8)),
    };

    for (const msg of messages) {
      msg.reconciliation = {
        ...msg.reconciliation,
        status: "matched",
        matchedTransactionHash: tx.hash,
        matchedTransactionAmount: getMessageNetAmount(msg),
        matchedTransactionTimestamp: tx.timestamp,
        matchedTransactionFrom: tx.from || null,
        landedInWallet: true,
        manualBatch: true,
        manualBatchMessageCount: messages.length,
        manualBatchGrossAmount: Number(grossAmount.toFixed(8)),
        manualBatchNetAmount: Number(netAmount.toFixed(8)),
      };
    }
  }
}

function upsertManualReconciliation(store, reconciliation) {
  const normalized = {
    id: reconciliation.id || randomUUID(),
    walletHash: String(reconciliation.walletHash || "").toLowerCase(),
    telegramMessageIds: [...new Set((reconciliation.telegramMessageIds || []).filter(Boolean))],
    note: reconciliation.note || "",
    createdAt: reconciliation.createdAt || new Date().toISOString(),
  };

  store.manualReconciliations = (store.manualReconciliations || []).filter(
    (item) => item.id !== normalized.id && item.walletHash !== normalized.walletHash
  );
  store.manualReconciliations.push(normalized);
  return normalized;
}

async function syncWalletTransactions(store, walletKey, mode = "incremental") {
  const walletAddress = getWalletAddress(walletKey);
  let incoming = [];
  let syncSource = mode === "full" ? "bscscan-html" : "rpc";
  const syncTime = new Date().toISOString();
  const walletSync = ensureWalletSyncState(store.sync, walletKey);

  try {
    if (mode === "full") {
      incoming = await fetchTransactionsFromExplorer(walletAddress, { fullHistory: true });
    } else {
      incoming = await fetchTransactionsFromRpc(walletAddress, walletSync.lastBlock || 0);
    }
  } catch (primaryError) {
    try {
      if (mode === "full") {
        incoming = await fetchTransactionsFromRpc(walletAddress, 0, { fullHistory: true });
        syncSource = "rpc";
      } else {
        incoming = await fetchTransactionsFromExplorer(walletAddress, { fullHistory: false });
        syncSource = "bscscan-html";
      }
    } catch (fallbackError) {
      throw new Error(`${WALLET_CONFIGS[walletKey].label} sync failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
    }
  }

  incoming.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  incoming = incoming.filter((tx) => Number(tx.amount) >= CONFIG.minTransactionAmount);

  const otherTransactions = store.transactions.filter((tx) => tx.walletAddress !== walletAddress);

  if (mode === "full") {
    store.transactions = dedupeTransactions([...otherTransactions, ...incoming]);
    walletSync.lastBlock = incoming.reduce((max, tx) => Math.max(max, Number(tx.blockNumber) || 0), 0);
    walletSync.lastCheckedAt = syncTime;
    walletSync.lastError = null;
    walletSync.lastSource = syncSource;
    walletSync.baselineTimestamp = incoming.length ? incoming[incoming.length - 1].timestamp : null;
    walletSync.initialized = true;
    walletSync.lastMode = "full";
    walletSync.lastFullSyncAt = syncTime;
    return;
  }

  const knownHashes = new Set(
    store.transactions
      .filter((tx) => tx.walletAddress === walletAddress)
      .map((tx) => tx.txKey || buildTransactionKey(tx))
  );

  if (!walletSync.initialized) {
    const newestIncomingTimestamp = incoming.length > 0 ? new Date(incoming[0].timestamp).getTime() : Date.now();
    const initialBaseline = newestIncomingTimestamp - CONFIG.initialBackfillHours * 60 * 60 * 1000;
    const initialTransactions = incoming.filter((tx) => new Date(tx.timestamp).getTime() >= initialBaseline);

    store.transactions = [...otherTransactions];
    for (const tx of initialTransactions) {
      const key = tx.txKey || buildTransactionKey(tx);
      if (!knownHashes.has(key)) {
        store.transactions.push(tx);
        knownHashes.add(key);
      }
    }

    walletSync.lastBlock = incoming.reduce((max, tx) => Math.max(max, Number(tx.blockNumber) || 0), walletSync.lastBlock || 0);
    walletSync.lastCheckedAt = syncTime;
    walletSync.lastError = null;
    walletSync.lastSource = syncSource;
    walletSync.baselineTimestamp = new Date(initialBaseline).toISOString();
    walletSync.initialized = true;
    walletSync.lastMode = "incremental";
    walletSync.lastIncrementalSyncAt = syncTime;
    store.transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return;
  }

  const baselineTimestamp = walletSync.baselineTimestamp ? new Date(walletSync.baselineTimestamp).getTime() : 0;
  incoming = incoming.filter((tx) => {
    const txTime = new Date(tx.timestamp).getTime();
    return txTime >= baselineTimestamp || Number(tx.blockNumber) > (walletSync.lastBlock || 0);
  });

  store.transactions = [...otherTransactions, ...store.transactions.filter((tx) => tx.walletAddress === walletAddress)];
  for (const tx of incoming) {
    const key = tx.txKey || buildTransactionKey(tx);
    if (!knownHashes.has(key)) {
      store.transactions.push(tx);
      knownHashes.add(key);
    }
    if (tx.blockNumber > (walletSync.lastBlock || 0)) {
      walletSync.lastBlock = tx.blockNumber;
    }
  }

  store.transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  walletSync.lastCheckedAt = syncTime;
  walletSync.lastError = null;
  walletSync.lastSource = syncSource;
  walletSync.lastMode = "incremental";
  walletSync.lastIncrementalSyncAt = syncTime;
}

async function fetchTransactions(mode = "incremental") {
  const store = readStore();
  await syncWalletTransactions(store, "deposit", mode);
  if (CONFIG.withdrawalWalletAddress !== CONFIG.depositWalletAddress) {
    await syncWalletTransactions(store, "withdrawal", mode);
  } else {
    const withdrawalSync = ensureWalletSyncState(store.sync, "withdrawal");
    withdrawalSync.trackedAddress = CONFIG.withdrawalWalletAddress;
    withdrawalSync.lastCheckedAt = store.sync.wallets.deposit.lastCheckedAt;
    withdrawalSync.lastError = "Withdrawal wallet is identical to deposit wallet. Set WITHDRAWAL_WALLET_ADDRESS to a different address.";
  }
  writeStore(store);
  return store;
}

function dedupeTransactions(transactions) {
  const seen = new Set();
  return transactions.filter((tx) => {
    const key = tx.txKey || buildTransactionKey(tx);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function dedupeByHash(transactions) {
  const seen = new Set();
  return transactions.filter((tx) => {
    const key = tx.txKey || buildTransactionKey(tx);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function fetchTransactionsFromExplorer(walletAddress, options = {}) {
  if (CONFIG.bscApiKey) {
    try {
      return await fetchTransactionsFromBscScanApi(walletAddress, options);
    } catch (_error) {
      return fetchTransactionsFromExplorerHtml(walletAddress, options);
    }
  }
  return fetchTransactionsFromExplorerHtml(walletAddress, options);
}

async function fetchTransactionsFromBscScanApi(walletAddress, options = {}) {
  const fullHistory = Boolean(options.fullHistory);
  const transactions = [];
  const seenHashes = new Set();
  const maxPages = fullHistory ? 1000 : 5;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await axios.get(CONFIG.bscApiBase, {
      params: {
        module: "account",
        action: "tokentx",
        address: walletAddress,
        contractaddress: CONFIG.usdtContract,
        page,
        offset: 100,
        sort: "desc",
        apikey: CONFIG.bscApiKey,
      },
      timeout: 20000,
    });

    const payload = response.data || {};
    if (!Array.isArray(payload.result)) {
      throw new Error(`BscScan API returned ${payload.message || "an invalid response"} for ${walletAddress}`);
    }
    if (payload.status === "0" && payload.message && payload.message !== "No transactions found") {
      throw new Error(`BscScan API returned ${payload.message} for ${walletAddress}`);
    }
    const result = Array.isArray(payload.result) ? payload.result : [];
    if (result.length === 0) {
      break;
    }

    const pageRows = result.map((tx) => normalizeTransaction(tx, walletAddress));
    const newRows = pageRows.filter((row) => {
      const key = row.txKey || buildTransactionKey(row);
      if (seenHashes.has(key)) {
        return false;
      }
      seenHashes.add(key);
      return true;
    });

    if (newRows.length === 0) {
      break;
    }

    transactions.push(...newRows);
    if (result.length < 100) {
      break;
    }
  }

  return transactions;
}

async function fetchTransactionsFromExplorerHtml(walletAddress, options = {}) {
  const fullHistory = Boolean(options.fullHistory);
  const transactions = [];
  const seenHashes = new Set();
  const maxPages = fullHistory ? 1000 : 5;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await axios.get("https://bscscan.com/tokentxns", {
      params: {
        a: walletAddress,
        p: page,
        ps: 100,
      },
      timeout: 20000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const rawRowCount = countBscScanTransferRows(response.data);
    const pageRows = parseBscScanTransferPage(response.data, walletAddress);
    if (pageRows.length === 0) {
      break;
    }

    const newRows = pageRows.filter((row) => {
      const key = row.txKey || buildTransactionKey(row);
      if (seenHashes.has(key)) {
        return false;
      }
      seenHashes.add(key);
      return true;
    });

    if (newRows.length === 0) {
      break;
    }

    transactions.push(...newRows);
    if (rawRowCount < 100) {
      break;
    }
  }

  return transactions;
}

async function fetchTransactionsFromRpc(walletAddress, startBlock, options = {}) {
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl, 56, { staticNetwork: true });
  const latestBlock = await provider.getBlockNumber();
  const fullHistory = Boolean(options.fullHistory);
  const initialFromBlock = startBlock > 0
    ? startBlock
    : fullHistory
      ? 0
      : Math.max(0, latestBlock - 20000);
  const transferTopic = ethers.id("Transfer(address,address,uint256)");
  const paddedRecipient = ethers.zeroPadValue(walletAddress, 32);
  const paddedSender = ethers.zeroPadValue(walletAddress, 32);
  const step = 2000;
  const logs = [];

  for (let fromBlock = initialFromBlock; fromBlock <= latestBlock; fromBlock += step + 1) {
    const toBlock = Math.min(latestBlock, fromBlock + step);
    const [incomingBatch, outgoingBatch] = await Promise.all([
      provider.getLogs({
        address: CONFIG.usdtContract,
        fromBlock,
        toBlock,
        topics: [transferTopic, null, paddedRecipient],
      }),
      provider.getLogs({
        address: CONFIG.usdtContract,
        fromBlock,
        toBlock,
        topics: [transferTopic, paddedSender, null],
      }),
    ]);
    logs.push(...incomingBatch, ...outgoingBatch);
  }

  const uniqueBlockNumbers = [...new Set(logs.map((log) => Number(log.blockNumber)))];
  const blockEntries = await Promise.all(
    uniqueBlockNumbers.map(async (blockNumber) => {
      const block = await provider.getBlock(blockNumber);
      return [blockNumber, block];
    })
  );
  const blocksByNumber = new Map(blockEntries);

  return logs.map((log) => {
    const block = blocksByNumber.get(Number(log.blockNumber));
    const timestamp = new Date(Number(block.timestamp) * 1000).toISOString();
    return normalizeRpcTransaction(log, timestamp, walletAddress);
  });
}

function parseBscScanTransferPage(html, walletAddress) {
  const $ = cheerio.load(html);
  const rows = [];
  const normalizedWalletAddress = String(walletAddress || "").toLowerCase();

  $("tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 13) {
      return;
    }

    const hash = $(cells[1]).find("a[href^='/tx/']").first().text().trim();
    const blockText = $(cells[4]).text().trim();
    const timestampText = $(cells[5]).text().trim();
    const fromCell = $(cells[8]);
    const directionText = $(cells[9]).text().trim().toUpperCase();
    const toCell = $(cells[10]);
    const toText = toCell.text().trim();
    const amountText = $(cells[11]).find(".td_showAmount").first().text().trim();
    const tokenLink = $(cells[12]).find("a[href^='/token/']").first();
    const tokenHref = tokenLink.attr("href") || "";

    if (!hash || !tokenHref.toLowerCase().includes(CONFIG.usdtContract)) {
      return;
    }

    let fromAddress = extractAddressFromCell(fromCell);
    let toAddress = extractAddressFromCell(toCell);

    if (directionText === "IN") {
      fromAddress ||= $(cells[8]).text().trim();
      toAddress = normalizedWalletAddress;
    } else if (directionText === "OUT") {
      fromAddress = normalizedWalletAddress;
      toAddress ||= toText;
    } else {
      fromAddress ||= $(cells[8]).text().trim();
      toAddress ||= toText || normalizedWalletAddress;
    }

    const normalizedTo = String(toAddress || "").toLowerCase();
    const normalizedFrom = String(fromAddress || "").toLowerCase();

    if (normalizedTo !== normalizedWalletAddress && normalizedFrom !== normalizedWalletAddress) {
      return;
    }

    const amount = Number(amountText.replace(/,/g, ""));
    const timestamp = timestampText
      ? new Date(`${timestampText} UTC`).toISOString()
      : new Date().toISOString();

    const normalized = {
      id: hash,
      hash,
      walletAddress: normalizedWalletAddress,
      blockNumber: Number(blockText),
      from: normalizedFrom,
      to: normalizedTo,
      tokenSymbol: "USDT",
      tokenName: "Tether USD",
      contractAddress: CONFIG.usdtContract,
      amount,
      timestamp,
      raw: {
        source: "bscscan-html",
      },
    };
    normalized.txKey = buildTransactionKey(normalized);
    rows.push(normalized);
  });

  return rows;
}

function countBscScanTransferRows(html) {
  const $ = cheerio.load(html);
  return $("tbody tr").length;
}

function extractAddressFromHref(href) {
  const match = String(href || "").match(/\/address\/(0x[a-fA-F0-9]{40})/);
  return match ? match[1] : null;
}

function extractAddressFromCell($cell) {
  const hrefAddress = extractAddressFromHref($cell.find("a[href*='/address/']").first().attr("href") || "");
  if (hrefAddress) {
    return hrefAddress;
  }

  const clipboardAddress = String(
    $cell.find("[data-clipboard-text]").first().attr("data-clipboard-text")
    || $cell.find("[data-address]").first().attr("data-address")
    || $cell.find("[data-highlight-target]").first().attr("data-highlight-target")
    || ""
  );
  const directMatch = clipboardAddress.match(/0x[a-fA-F0-9]{40}/);
  if (directMatch) {
    return directMatch[0];
  }

  const textMatch = $cell.text().match(/0x[a-fA-F0-9]{40}/);
  return textMatch ? textMatch[0] : null;
}

function messageReferencesCurrentWallet(text) {
  const match = String(text || "").match(/0x[a-fA-F0-9]{4,}\.\.\.[a-fA-F0-9]{4,}/);
  if (!match) {
    return true;
  }

  const [prefix, suffix] = match[0].toLowerCase().split("...");
  return CONFIG.depositWalletAddress.startsWith(prefix) && CONFIG.depositWalletAddress.endsWith(suffix);
}

function extractHash(text) {
  const match = String(text || "").match(/0x[a-fA-F0-9]{64}/);
  return match ? match[0].toLowerCase() : null;
}

function extractHashes(text) {
  return [...String(text || "").matchAll(/0x[a-fA-F0-9]{64}/g)].map((match) => match[0].toLowerCase());
}

function extractLabeledHash(text, label) {
  const escapedLabel = String(label || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(text || "").match(new RegExp(`${escapedLabel}\\s*:?\\s*(0x[a-fA-F0-9]{64})`, "i"));
  return match ? match[1].toLowerCase() : null;
}

function extractTelegramButtonLabels(message) {
  const keyboard = message?.reply_markup?.inline_keyboard;
  if (!Array.isArray(keyboard)) {
    return [];
  }

  return keyboard
    .flatMap((row) => Array.isArray(row) ? row : [])
    .map((button) => String(button?.text || "").trim())
    .filter(Boolean);
}

function decodeTelegramExportText(text) {
  return String(text || "")
    .replace(/ðŸ’°/g, "💰")
    .replace(/â€¦/g, "…")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, "")
    .trim();
}

function parseTelegramExportHtml(html, filename) {
  const $ = cheerio.load(html);
  const messages = [];
  const chatTitle = $(".page_header .text.bold").first().text().trim() || "Telegram Export";

  $(".message.default, .message.default.clearfix").each((_, messageNode) => {
    const body = $(messageNode).find(".body").first();
    if (!body.length) {
      return;
    }

    const messageIdRaw = ($(messageNode).attr("id") || "").replace("message", "");
    const timestampTitle = body.find(".pull_right.date.details").attr("title") || "";
    const fromName = body.find(".from_name").first().text().trim();
    const textNode = body.find(".text").first();
    const htmlText = textNode.html() || "";
    const buttonLabels = body.find(".bot_buttons_table .bot_button div").map((_, node) => $(node).text().trim()).get();
    const hasViewTxButton = buttonLabels.includes("View Tx");
    const hasViewFeesTxButton = buttonLabels.includes("View Fees Tx");
    const plainText = decodeTelegramExportText(
      textNode
        .text()
        .replace(/\s+\n/g, "\n")
        .replace(/\n\s+/g, "\n")
        .replace(/\s{2,}/g, " ")
        .trim()
    );

    if (!timestampTitle || !plainText) {
      return;
    }

    const normalizedTimestamp = parseTelegramExportTimestamp(timestampTitle);
    if (!normalizedTimestamp) {
      return;
    }

    const amount = extractAmount(plainText);
    const txHash = extractLabeledHash(plainText, "Transaction Hash") || extractHash(plainText);
    const feesTxHash = extractLabeledHash(plainText, "Fees");
    const allHashes = extractHashes(plainText);

    messages.push({
      id: `export-${filename}-${messageIdRaw || randomUUID()}`,
      messageId: messageIdRaw ? Number(messageIdRaw) : null,
      chatId: chatTitle,
      sender: fromName || chatTitle,
      text: plainText,
      amount,
      timestamp: normalizedTimestamp,
      raw: {
        source: "telegram-export-html",
        filename,
        txHash,
        feesTxHash,
        allHashes,
        buttonLabels,
        hasViewTxButton,
        hasViewFeesTxButton,
        html: htmlText,
      },
    });
  });

  return messages;
}

function parseTelegramExportTimestamp(value) {
  const match = String(value || "").match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2}) UTC([+-]\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year, hour, minute, second, offsetHour, offsetMinute] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}${offsetHour}:${offsetMinute}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function syncTransactionsSafe(mode = "incremental") {
  try {
    return await fetchTransactions(mode);
  } catch (error) {
    const store = readStore();
    const timestamp = new Date().toISOString();
    ensureWalletSyncState(store.sync, "deposit").lastCheckedAt = timestamp;
    ensureWalletSyncState(store.sync, "deposit").lastError = error.message;
    ensureWalletSyncState(store.sync, "withdrawal").lastCheckedAt = timestamp;
    ensureWalletSyncState(store.sync, "withdrawal").lastError = error.message;
    writeStore(store);
    return store;
  }
}

function buildWorkbook(state) {
  const workbook = XLSX.utils.book_new();
  const matchedMessages = state.telegramMessages.filter((msg) => msg.reconciliation?.status === "matched");
  const unmatchedMessages = state.telegramMessages.filter((msg) => msg.reconciliation?.status !== "matched");
  const sumAmounts = (items, selector) => items.reduce((total, item) => total + Number(selector(item) || 0), 0);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - (7 * 24 * 60 * 60 * 1000);
  const todayMessages = state.telegramMessages.filter((msg) => new Date(msg.timestamp).getTime() >= todayStart);
  const weekMessages = state.telegramMessages.filter((msg) => new Date(msg.timestamp).getTime() >= weekStart);
  const matchedVariance = matchedMessages.reduce(
    (total, msg) => total + Math.abs(Number(msg.amount || 0) - Number(msg.reconciliation?.matchedTransactionAmount || 0)),
    0
  );
  const matchedRate = state.telegramMessages.length
    ? Number(((matchedMessages.length / state.telegramMessages.length) * 100).toFixed(2))
    : 0;

  const txRows = state.depositTransactions.map((tx) => ({
    hash: tx.hash,
    txUrl: `https://bscscan.com/tx/${tx.hash}`,
    amount: tx.amount,
    timestamp: tx.timestamp,
    from: tx.from,
    to: tx.to,
    status: tx.reconciliation.status,
    matchedMessageAmount: tx.reconciliation.matchedMessageAmount,
    matchedMessageTimestamp: tx.reconciliation.matchedMessageTimestamp,
    matchedMessageText: tx.reconciliation.matchedMessageText,
  }));

  const telegramRows = state.telegramMessages.map((msg) => ({
    id: msg.id,
    chatId: msg.chatId,
    sender: msg.sender,
    amount: msg.amount,
    timestamp: msg.timestamp,
    text: msg.text,
    status: msg.reconciliation?.status || "unmatched",
    landedInWallet: msg.reconciliation?.landedInWallet ? "Yes" : "No",
    originTxHash: msg.reconciliation?.originTxHash || "",
    originTxUrl: msg.reconciliation?.originTxUrl || "",
    settlementTxHash: msg.reconciliation?.settlementTxHash || "",
    settlementTxUrl: msg.reconciliation?.settlementTxUrl || "",
    feesTxHash: msg.reconciliation?.feesTxHash || "",
    feesTxUrl: msg.reconciliation?.feesTxUrl || "",
    matchedWalletHash: msg.reconciliation?.matchedTransactionHash || "",
    matchedWalletUrl: msg.reconciliation?.matchedTransactionHash ? `https://bscscan.com/tx/${msg.reconciliation.matchedTransactionHash}` : "",
    matchedWalletAmount: msg.reconciliation?.matchedTransactionAmount ?? "",
    matchedWalletTimestamp: msg.reconciliation?.matchedTransactionTimestamp || "",
    linkedSettlementTimestamp: msg.reconciliation?.linkedSettlementTimestamp || "",
  }));

  const summaryRows = [
    { metric: "Deposit wallet", value: CONFIG.depositWalletAddress },
    { metric: "Withdrawal wallet", value: CONFIG.withdrawalWalletAddress },
    { metric: "Telegram-first match base", value: "Enabled" },
    { metric: "Deposit wallet transactions", value: state.depositTransactions.length },
    { metric: "Withdrawal wallet transactions", value: state.withdrawalTransactions.length },
    { metric: "Inter-wallet transfers", value: state.interWalletTransfers.length },
    { metric: "Telegram messages", value: state.telegramMessages.length },
    { metric: "Matched telegram messages", value: matchedMessages.length },
    { metric: "Unmatched telegram messages", value: unmatchedMessages.length },
    { metric: "Telegram total amount", value: sumAmounts(state.telegramMessages, (msg) => msg.amount) },
    { metric: "Telegram amount today", value: sumAmounts(todayMessages, (msg) => msg.amount) },
    { metric: "Telegram amount last 7 days", value: sumAmounts(weekMessages, (msg) => msg.amount) },
    { metric: "Matched wallet amount", value: sumAmounts(matchedMessages, (msg) => msg.reconciliation?.matchedTransactionAmount) },
    { metric: "Unmatched telegram amount", value: sumAmounts(unmatchedMessages, (msg) => msg.amount) },
    { metric: "Matched rate %", value: matchedRate },
    { metric: "Matched variance amount", value: matchedVariance },
    { metric: "Deposit wallet total amount", value: sumAmounts(state.depositTransactions, (tx) => tx.amount) },
    { metric: "Withdrawal wallet total amount", value: sumAmounts(state.withdrawalTransactions, (tx) => tx.amount) },
    { metric: "Last deposit wallet sync", value: state.sync.wallets.deposit.lastCheckedAt || "" },
    { metric: "Last deposit wallet error", value: state.sync.wallets.deposit.lastError || "" },
    { metric: "Last withdrawal wallet sync", value: state.sync.wallets.withdrawal.lastCheckedAt || "" },
    { metric: "Last withdrawal wallet error", value: state.sync.wallets.withdrawal.lastError || "" },
    { metric: "Last telegram sync", value: state.sync.telegram.lastCheckedAt || "" },
    { metric: "Last telegram error", value: state.sync.telegram.lastError || "" },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows, { header: ["metric", "value"] });
  const telegramSheet = XLSX.utils.json_to_sheet(telegramRows, {
    header: [
      "id",
      "chatId",
      "sender",
      "amount",
      "timestamp",
      "text",
      "status",
      "landedInWallet",
      "originTxHash",
      "originTxUrl",
      "settlementTxHash",
      "settlementTxUrl",
      "feesTxHash",
      "feesTxUrl",
      "matchedWalletHash",
      "matchedWalletUrl",
      "matchedWalletAmount",
      "matchedWalletTimestamp",
      "linkedSettlementTimestamp",
    ],
  });
  const transactionsSheet = XLSX.utils.json_to_sheet(txRows, {
    header: [
      "hash",
      "txUrl",
      "amount",
      "timestamp",
      "from",
      "to",
      "status",
      "matchedMessageAmount",
      "matchedMessageTimestamp",
      "matchedMessageText",
    ],
  });

  telegramRows.forEach((row, index) => {
    const excelRow = index + 2;
    if (row.originTxHash && row.originTxUrl) {
      telegramSheet[`I${excelRow}`] = {
        t: "s",
        v: row.originTxHash,
        l: { Target: row.originTxUrl, Tooltip: "Open origin transaction on BscScan" },
      };
    }
    if (row.settlementTxHash && row.settlementTxUrl) {
      telegramSheet[`K${excelRow}`] = {
        t: "s",
        v: row.settlementTxHash,
        l: { Target: row.settlementTxUrl, Tooltip: "Open settlement transaction on BscScan" },
      };
    }
    if (row.feesTxHash && row.feesTxUrl) {
      telegramSheet[`M${excelRow}`] = {
        t: "s",
        v: row.feesTxHash,
        l: { Target: row.feesTxUrl, Tooltip: "Open fees transaction on BscScan" },
      };
    }
    if (row.matchedWalletHash && row.matchedWalletUrl) {
      telegramSheet[`O${excelRow}`] = {
        t: "s",
        v: row.matchedWalletHash,
        l: { Target: row.matchedWalletUrl, Tooltip: "Open matched wallet transaction on BscScan" },
      };
    }
  });

  txRows.forEach((row, index) => {
    const excelRow = index + 2;
    if (row.hash && row.txUrl) {
      transactionsSheet[`A${excelRow}`] = {
        t: "s",
        v: row.hash,
        l: { Target: row.txUrl, Tooltip: "Open wallet transaction on BscScan" },
      };
    }
  });

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, telegramSheet, "Telegram");
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Deposit Transactions");
  return workbook;
}

function getDepositCalendarDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function buildDayWiseDepositWorkbook(state) {
  const workbook = XLSX.utils.book_new();
  const dailySummaryMap = new Map();

  const depositRows = state.depositTransactions.map((tx) => {
    const depositDate = getDepositCalendarDate(tx.timestamp);
    const amount = Number(tx.amount || 0);
    const current = dailySummaryMap.get(depositDate) || {
      date: depositDate,
      noOfDeposit: 0,
      amtOfDeposit: 0,
    };

    current.noOfDeposit += 1;
    current.amtOfDeposit = Number((current.amtOfDeposit + amount).toFixed(8));
    dailySummaryMap.set(depositDate, current);

    return {
      date: depositDate,
      timestamp: tx.timestamp,
      amount,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      status: tx.reconciliation?.status || "",
    };
  });

  const dailySummaryRows = Array.from(dailySummaryMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date,
      noOfDeposit: row.noOfDeposit,
      amtOfDeposit: row.amtOfDeposit,
    }));

  const datedDepositsRows = depositRows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const summarySheet = XLSX.utils.json_to_sheet(dailySummaryRows, {
    header: ["date", "noOfDeposit", "amtOfDeposit"],
  });
  const datedDepositsSheet = XLSX.utils.json_to_sheet(datedDepositsRows, {
    header: ["date", "timestamp", "amount", "hash", "from", "to", "status"],
  });

  summarySheet["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
  ];
  datedDepositsSheet["!cols"] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
    { wch: 68 },
    { wch: 46 },
    { wch: 46 },
    { wch: 14 },
  ];

  datedDepositsRows.forEach((row, index) => {
    const excelRow = index + 2;
    if (row.hash) {
      datedDepositsSheet[`D${excelRow}`] = {
        t: "s",
        v: row.hash,
        l: { Target: `https://bscscan.com/tx/${row.hash}`, Tooltip: "Open deposit transaction on BscScan" },
      };
    }
  });

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Day Wise Summary");
  XLSX.utils.book_append_sheet(workbook, datedDepositsSheet, "All Deposits");
  return workbook;
}

async function getState() {
  const store = readStore();
  await enrichTelegramFees(store);
  const usdtTransactions = store.transactions.filter((tx) => isTrackedUsdtTransaction(tx));
  const depositTransactions = usdtTransactions
    .filter((tx) => tx.walletAddress === CONFIG.depositWalletAddress)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const withdrawalTransactions = usdtTransactions
    .filter((tx) => tx.walletAddress === CONFIG.withdrawalWalletAddress)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const depositIncomingTransactions = depositTransactions.filter((tx) => tx.to === CONFIG.depositWalletAddress);
  const reconciled = reconcile({
    ...store,
    transactions: depositIncomingTransactions,
  });
  const interWalletTransfers = dedupeByHash(
    usdtTransactions.filter((tx) => {
      const from = tx.from;
      const to = tx.to;
      return (
        (from === CONFIG.depositWalletAddress && to === CONFIG.withdrawalWalletAddress)
        || (from === CONFIG.withdrawalWalletAddress && to === CONFIG.depositWalletAddress)
      );
    })
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const walletSnapshots = {};
  for (const walletKey of Object.keys(WALLET_CONFIGS)) {
    const walletAddress = getWalletAddress(walletKey);
    try {
      walletSnapshots[walletKey] = await getWalletSnapshot(walletAddress, WALLET_CONFIGS[walletKey].label);
    } catch (error) {
      walletSnapshots[walletKey] = {
        label: WALLET_CONFIGS[walletKey].label,
        address: walletAddress,
        network: "BNB Smart Chain",
        bscscanAddressUrl: `https://bscscan.com/address/${walletAddress}`,
        bscscanTokenUrl: `https://bscscan.com/token/${CONFIG.usdtContract}?a=${walletAddress}`,
        nativeSymbol: "BNB",
        tokenSymbol: "USDT",
        nativeBalance: null,
        tokenBalance: null,
        transactionCount: null,
        latestBlock: null,
        updatedAt: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  return {
    config: {
      depositWalletAddress: CONFIG.depositWalletAddress,
      withdrawalWalletAddress: CONFIG.withdrawalWalletAddress,
      walletsAreDistinct: CONFIG.depositWalletAddress !== CONFIG.withdrawalWalletAddress,
      usdtContract: CONFIG.usdtContract,
      pollIntervalMs: CONFIG.pollIntervalMs,
      rpcUrl: CONFIG.rpcUrl,
      telegramChatId: CONFIG.telegramChatId || null,
      hasBscApiKey: Boolean(CONFIG.bscApiKey),
      hasTelegramBotToken: Boolean(CONFIG.telegramBotToken),
      matchWindowMinutes: CONFIG.matchWindowMinutes,
      amountTolerance: CONFIG.amountTolerance,
      initialBackfillHours: CONFIG.initialBackfillHours,
      minTransactionAmount: CONFIG.minTransactionAmount,
    },
    walletSnapshots,
    sync: store.sync,
    depositTransactions: reconciled.transactions,
    withdrawalTransactions,
    interWalletTransfers,
    telegramMessages: reconciled.telegramMessages,
  };
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/audit-assets", express.static(path.join(__dirname, "public")));

async function handleState(_req, res) {
  res.json(await getState());
}

app.get("/api/state", handleState);
app.get("/audit-api/state", handleState);

async function handleWalletSync(req, res) {
  const mode = req.body?.mode === "full" ? "full" : "incremental";
  await syncTransactionsSafe(mode);
  res.json(await getState());
}

app.post("/api/sync/wallet", handleWalletSync);
app.post("/audit-api/sync/wallet", handleWalletSync);

async function handleTelegramSync(req, res) {
  const store = readStore();
  const mode = req.body?.mode === "all" ? "all" : "incremental";
  store.sync.telegram.lastCheckedAt = new Date().toISOString();
  store.sync.telegram.lastError = store.sync.telegram.historicalImportSupported
    ? null
    : "Telegram Bot API cannot backfill old chat history; it only receives new messages after the bot is added and running.";
  store.sync.telegram.lastMode = mode;
  writeStore(store);
  res.json(await getState());
}

app.post("/api/sync/telegram", handleTelegramSync);
app.post("/audit-api/sync/telegram", handleTelegramSync);

async function handleTelegramImport(req, res) {
  const files = req.files || [];
  if (!files.length) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const store = readStore();
  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const html = file.buffer.toString("utf8");
    const parsed = parseTelegramExportHtml(html, file.originalname).map(normalizeImportedTelegramMessage);
    for (const message of parsed) {
      if (shouldSkipImportedTelegramMessage(store, message)) {
        skipped += 1;
        continue;
      }
      if (upsertTelegramMessage(store, message)) {
        imported += 1;
      }
      updateTelegramImportCursor(store, message);
    }
  }

  store.telegramMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  store.sync.telegram.lastCheckedAt = new Date().toISOString();
  store.sync.telegram.lastError = null;
  store.sync.telegram.lastMode = "import";
  store.sync.telegram.lastMessageAt = store.telegramMessages[0]?.timestamp || store.sync.telegram.lastMessageAt;
  writeStore(store);

  res.json({
    imported,
    skipped,
    totalMessages: store.telegramMessages.length,
    state: await getState(),
  });
}

app.post("/api/telegram/import", upload.array("files"), handleTelegramImport);
app.post("/audit-api/telegram/import", upload.array("files"), handleTelegramImport);

app.post("/api/telegram/mock", async (req, res) => {
  const { text, amount, sender, timestamp } = req.body || {};
  const store = readStore();
  upsertTelegramMessage(store, {
    id: randomUUID(),
    messageId: null,
    chatId: "manual",
    sender: sender || "manual",
    text: text || "",
    amount: amount ?? extractAmount(text || ""),
    timestamp: timestamp || new Date().toISOString(),
    raw: req.body || {},
  });
  store.sync.telegram.lastMessageAt = timestamp || new Date().toISOString();
  writeStore(store);
  res.json(await getState());
});

app.post("/api/reconcile/manual-batch", async (req, res) => {
  const { walletHash, telegramMessageIds, note } = req.body || {};
  if (!walletHash || !Array.isArray(telegramMessageIds) || !telegramMessageIds.length) {
    res.status(400).json({ error: "walletHash and telegramMessageIds are required" });
    return;
  }

  const store = readStore();
  const walletTx = store.transactions.find((tx) => tx.hash === String(walletHash).toLowerCase());
  if (!walletTx) {
    res.status(404).json({ error: "Wallet transaction not found" });
    return;
  }

  const missingMessageIds = telegramMessageIds.filter((id) => !store.telegramMessages.some((msg) => msg.id === id));
  if (missingMessageIds.length) {
    res.status(404).json({ error: "Telegram messages not found", missingMessageIds });
    return;
  }

  const saved = upsertManualReconciliation(store, {
    walletHash,
    telegramMessageIds,
    note,
  });
  writeStore(store);
  res.json({ saved, state: await getState() });
});

async function handleExport(_req, res) {
  const workbook = buildWorkbook(await getState());
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", "attachment; filename=usdt-dashboard-export.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
}

async function handleDaywiseExport(_req, res) {
  const workbook = buildDayWiseDepositWorkbook(await getState());
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", "attachment; filename=usdt-daywise-deposits.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
}

app.get("/api/export.xlsx", handleExport);
app.get("/audit-api/export.xlsx", handleExport);
app.get("/api/export-daywise.xlsx", handleDaywiseExport);
app.get("/audit-api/export-daywise.xlsx", handleDaywiseExport);

let bot;
if (CONFIG.telegramBotToken) {
  bot = new Telegraf(CONFIG.telegramBotToken);

  bot.on(["message", "channel_post"], async (ctx) => {
    const message = ctx.message || ctx.channelPost || ctx.update?.channel_post;
    if (!message) {
      return;
    }

    const incomingChatId = String(message.chat?.id || "");
    if (CONFIG.telegramChatId && CONFIG.telegramChatId !== incomingChatId) {
      return;
    }

    const store = readStore();
    const normalized = normalizeTelegramMessage(message);
    upsertTelegramMessage(store, normalized);
    store.telegramMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    store.sync.telegram.lastMessageAt = normalized.timestamp;
    writeStore(store);
  });

  bot.launch().catch((error) => {
    const store = readStore();
    store.sync.telegram.lastError = `Telegram bot failed: ${error.message}`;
    writeStore(store);
  });
}

setInterval(() => {
  syncTransactionsSafe("incremental");
}, CONFIG.pollIntervalMs);

syncTransactionsSafe("incremental");

app.listen(CONFIG.port, () => {
  console.log(`Dashboard running on http://localhost:${CONFIG.port}`);
});

process.once("SIGINT", () => {
  if (bot) {
    bot.stop("SIGINT");
  }
  process.exit(0);
});

process.once("SIGTERM", () => {
  if (bot) {
    bot.stop("SIGTERM");
  }
  process.exit(0);
});
