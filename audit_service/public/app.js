const stateUrl = "/audit-api/state";
let currentState = null;
let telegramStatusFilter = "all";
let activeView = "overview";

function short(value, start = 6, end = 4) {
  if (!value) {
    return "-";
  }
  if (value.length <= start + end) {
    return value;
  }
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

function formatAmount(value, symbol = "USDT", digits = 4) {
  if (value == null || Number.isNaN(Number(value))) {
    return "-";
  }
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })} ${symbol}`;
}

function sumAmounts(items, selector) {
  return items.reduce((total, item) => total + Number(selector(item) || 0), 0);
}

function ratio(part, total) {
  if (!total) {
    return "0%";
  }
  return `${((part / total) * 100).toFixed(1)}%`;
}

function getDailyAverage(items) {
  if (!items.length) {
    return 0;
  }
  const timestamps = items
    .map((item) => new Date(item.timestamp).getTime())
    .filter((value) => Number.isFinite(value));
  if (!timestamps.length) {
    return 0;
  }
  const first = Math.min(...timestamps);
  const last = Math.max(...timestamps);
  const spanDays = Math.max(1, Math.ceil((last - first) / 86400000) + 1);
  return sumAmounts(items, (item) => item.amount) / spanDays;
}

function summarizeFees(messages) {
  return sumAmounts(messages, (message) => {
    const reconciliation = message.reconciliation || {};
    return reconciliation.feesAmount || reconciliation.feeAmount || 0;
  });
}

function metricCard(label, value, note, tone = "") {
  return `
    <article class="metric-card ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
      <p>${note}</p>
    </article>
  `;
}

function configRow(label, value) {
  return `
    <div class="config-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

async function loadState() {
  const response = await fetch(stateUrl);
  currentState = await response.json();
  render(currentState);
}

function setView(nextView) {
  activeView = nextView;
  const views = ["overview", "deposit", "withdrawal", "internal"];
  for (const view of views) {
    document.getElementById(`${view}View`).classList.toggle("hidden", view !== nextView);
    document.getElementById(`${view}ViewButton`).classList.toggle("active", view === nextView);
  }
}

function render(state) {
  const depositSnapshot = state.walletSnapshots.deposit;
  const withdrawalSnapshot = state.walletSnapshots.withdrawal;
  const matchedMessages = state.telegramMessages.filter((msg) => msg.reconciliation?.status === "matched");
  const unmatchedMessages = state.telegramMessages.filter((msg) => msg.reconciliation?.status !== "matched");
  const depositTotal = sumAmounts(state.depositTransactions, (tx) => tx.amount);
  const withdrawalTotal = sumAmounts(state.withdrawalTransactions, (tx) => tx.amount);
  const internalTotal = sumAmounts(state.interWalletTransfers, (tx) => tx.amount);
  const unmatchedDepositTransactions = state.depositTransactions.filter((tx) => tx.reconciliation?.status !== "matched");
  const now = Date.now();
  const dayMs = 86400000;
  const depositTodayTransactions = state.depositTransactions.filter((tx) => now - new Date(tx.timestamp).getTime() <= dayMs);
  const depositWeekTransactions = state.depositTransactions.filter((tx) => now - new Date(tx.timestamp).getTime() <= dayMs * 7);
  const withdrawalTodayTransactions = state.withdrawalTransactions.filter((tx) => now - new Date(tx.timestamp).getTime() <= dayMs);
  const withdrawalWeekTransactions = state.withdrawalTransactions.filter((tx) => now - new Date(tx.timestamp).getTime() <= dayMs * 7);
  const depositAvgDaily = getDailyAverage(state.depositTransactions);
  const withdrawalAvgDaily = getDailyAverage(state.withdrawalTransactions);
  const matchedWalletTotal = sumAmounts(
    state.depositTransactions.filter((tx) => tx.reconciliation?.status === "matched"),
    (tx) => tx.amount
  );
  const matchedVariance = Math.abs(matchedWalletTotal - sumAmounts(matchedMessages, (msg) => msg.amount));
  const withdrawalOutgoing = state.withdrawalTransactions.filter((tx) => tx.from === state.config.withdrawalWalletAddress);
  const withdrawalIncoming = state.withdrawalTransactions.filter((tx) => tx.to === state.config.withdrawalWalletAddress);
  const withdrawalInternalTopups = withdrawalIncoming.filter((tx) => tx.from === state.config.depositWalletAddress);
  const withdrawalDistinctCounterparties = new Set(
    withdrawalOutgoing.map((tx) => tx.to).concat(withdrawalIncoming.map((tx) => tx.from)).filter(Boolean)
  ).size;
  const depositUnmatchedRows = Math.max(unmatchedMessages.length, unmatchedDepositTransactions.length);
  const depositFeesTotal = summarizeFees(matchedMessages);

  document.getElementById("depositWalletLink").href = depositSnapshot.bscscanAddressUrl;
  document.getElementById("withdrawalWalletLink").href = withdrawalSnapshot.bscscanAddressUrl;

  document.getElementById("heroHeadline").textContent = state.config.walletsAreDistinct
    ? "Both treasury wallets are now being watched from one dashboard."
    : "Deposit and withdrawal wallet are still configured as the same address.";
  document.getElementById("heroMeta").textContent = state.config.walletsAreDistinct
    ? `Deposit ${short(state.config.depositWalletAddress, 10, 8)} | Withdrawal ${short(state.config.withdrawalWalletAddress, 10, 8)}`
    : "Set a different WITHDRAWAL_WALLET_ADDRESS to unlock proper internal transfer tracking.";

  document.getElementById("summaryCards").innerHTML = [
    metricCard("Deposit balance", formatAmount(depositSnapshot.tokenBalance), `${formatAmount(depositSnapshot.nativeBalance, "BNB", 5)} gas balance on deposit wallet.`, "tone-mint"),
    metricCard("Withdrawal balance", formatAmount(withdrawalSnapshot.tokenBalance), `${formatAmount(withdrawalSnapshot.nativeBalance, "BNB", 5)} gas balance on withdrawal wallet.`, "tone-lilac"),
    metricCard("Deposit tx count", state.depositTransactions.length, `${formatAmount(depositTotal)} deposit wallet volume tracked locally.`, "tone-amber"),
    metricCard("Internal transfers", state.interWalletTransfers.length, `${formatAmount(internalTotal)} moved between both wallets.`, "tone-cream"),
  ].join("");

  document.getElementById("depositTabSummary").innerHTML = [
    metricCard("Wallet total", formatAmount(depositTotal), "Total deposit-side wallet volume tracked locally.", "tone-mint"),
    metricCard("Telegram total", formatAmount(sumAmounts(state.telegramMessages, (msg) => msg.amount)), "Imported Telegram ledger total for deposit flow.", "tone-lilac"),
    metricCard("Unmatched wallet", formatAmount(sumAmounts(unmatchedDepositTransactions, (tx) => tx.amount)), "Deposit wallet volume still waiting for reconciliation.", "tone-amber"),
    metricCard("Unmatched telegram", formatAmount(sumAmounts(unmatchedMessages, (msg) => msg.amount)), "Telegram volume still missing a matched wallet movement.", "tone-cream"),
    metricCard("Unmatched rows", depositUnmatchedRows, "Largest open row count between wallet and Telegram.", "tone-cream"),
    metricCard("Today", formatAmount(sumAmounts(depositTodayTransactions, (tx) => tx.amount)), `${depositTodayTransactions.length} deposit transactions in the last 24 hours.`, "tone-balance"),
    metricCard("7 day", formatAmount(sumAmounts(depositWeekTransactions, (tx) => tx.amount)), `${depositWeekTransactions.length} deposit transactions over the last 7 days.`, "tone-volume"),
    metricCard("Avg daily", formatAmount(depositAvgDaily), "Average daily deposit flow across tracked history.", "tone-signal"),
    metricCard("Projected week", formatAmount(depositAvgDaily * 7), "Simple 7-day run rate based on current average.", "tone-amber"),
    metricCard("Matched wallet", formatAmount(matchedWalletTotal), "Deposit wallet amount linked back to Telegram rows.", "tone-mint"),
    metricCard("Fees total", formatAmount(depositFeesTotal), "Fees captured from matched Telegram reconciliation data.", "tone-lilac"),
    metricCard("Matched %", ratio(matchedMessages.length, state.telegramMessages.length), `${matchedMessages.length} of ${state.telegramMessages.length} Telegram rows matched.`, "tone-signal"),
    metricCard("Variance", formatAmount(matchedVariance), "Gap between matched wallet total and matched Telegram total.", "tone-amber"),
    metricCard("Telegram rows", state.telegramMessages.length, "Imported Telegram rows included in deposit reconciliation.", "tone-cream"),
    metricCard("Wallet rows", state.depositTransactions.length, "Tracked token transfers on the deposit wallet.", "tone-balance"),
    metricCard("Matched rows", matchedMessages.length, "Telegram rows that currently reconcile cleanly.", "tone-volume"),
  ].join("");

  document.getElementById("withdrawalTabSummary").innerHTML = [
    metricCard("Wallet total", formatAmount(withdrawalTotal), "Total tracked movement touching the withdrawal wallet.", "tone-mint"),
    metricCard("Wallet balance", formatAmount(withdrawalSnapshot.tokenBalance), `${formatAmount(withdrawalSnapshot.nativeBalance, "BNB", 5)} native balance available.`, "tone-lilac"),
    metricCard("Outgoing wallet", formatAmount(sumAmounts(withdrawalOutgoing, (tx) => tx.amount)), "Value leaving the withdrawal wallet to users or other destinations.", "tone-amber"),
    metricCard("Incoming wallet", formatAmount(sumAmounts(withdrawalIncoming, (tx) => tx.amount)), "Value landing into the withdrawal wallet from top-ups or returns.", "tone-cream"),
    metricCard("Today", formatAmount(sumAmounts(withdrawalTodayTransactions, (tx) => tx.amount)), `${withdrawalTodayTransactions.length} withdrawal-side transactions in the last 24 hours.`, "tone-balance"),
    metricCard("7 day", formatAmount(sumAmounts(withdrawalWeekTransactions, (tx) => tx.amount)), `${withdrawalWeekTransactions.length} withdrawal-side transactions over the last 7 days.`, "tone-volume"),
    metricCard("Avg daily", formatAmount(withdrawalAvgDaily), "Average daily withdrawal-side flow across tracked history.", "tone-signal"),
    metricCard("Projected week", formatAmount(withdrawalAvgDaily * 7), "Simple 7-day run rate for the withdrawal wallet.", "tone-amber"),
    metricCard("Top-up volume", formatAmount(sumAmounts(withdrawalInternalTopups, (tx) => tx.amount)), "Internal funding received from the deposit wallet.", "tone-mint"),
    metricCard("Outgoing rows", withdrawalOutgoing.length, "Transactions leaving the withdrawal wallet.", "tone-lilac"),
    metricCard("Incoming rows", withdrawalIncoming.length, "Transactions arriving into the withdrawal wallet.", "tone-cream"),
    metricCard("Internal top-ups", withdrawalInternalTopups.length, "Detected deposit-to-withdrawal refill transactions.", "tone-signal"),
    metricCard("Counterparties", withdrawalDistinctCounterparties, "Unique addresses interacting with the withdrawal wallet.", "tone-amber"),
    metricCard("Wallet rows", state.withdrawalTransactions.length, "Tracked token transfers on the withdrawal wallet.", "tone-balance"),
  ].join("");

  document.getElementById("internalTabSummary").innerHTML = [
    metricCard("Internal transfer count", state.interWalletTransfers.length, "Detected transfers between the two treasury wallets.", "tone-mint"),
    metricCard("Internal transfer volume", formatAmount(internalTotal), "Combined value moved between deposit and withdrawal wallets.", "tone-lilac"),
    metricCard("Deposit -> Withdrawal", state.interWalletTransfers.filter((tx) => tx.from === state.config.depositWalletAddress).length, "Top-ups sent from deposit into the withdrawal wallet.", "tone-amber"),
    metricCard("Withdrawal -> Deposit", state.interWalletTransfers.filter((tx) => tx.from === state.config.withdrawalWalletAddress).length, "Reverse transfers back into the deposit wallet.", "tone-cream"),
    metricCard("Top-up volume", formatAmount(sumAmounts(state.interWalletTransfers.filter((tx) => tx.from === state.config.depositWalletAddress), (tx) => tx.amount)), "Internal refill volume pushed toward the withdrawal wallet.", "tone-balance"),
    metricCard("Return volume", formatAmount(sumAmounts(state.interWalletTransfers.filter((tx) => tx.from === state.config.withdrawalWalletAddress), (tx) => tx.amount)), "Internal value routed back into the deposit wallet.", "tone-signal"),
    metricCard("Latest movement", state.interWalletTransfers[0] ? formatDate(state.interWalletTransfers[0].timestamp) : "-", "Most recent inter-wallet transfer detected in local history.", "tone-volume"),
    metricCard("Pair health", state.config.walletsAreDistinct ? "Distinct" : "Same wallet", "Internal transfer tracking works properly only when both wallet addresses differ.", "tone-mint"),
  ].join("");

  document.getElementById("syncHeadline").textContent =
    `${ratio(matchedMessages.length, state.telegramMessages.length)} of deposit Telegram records are currently reconciled.`;
  document.getElementById("syncRibbon").textContent =
    `Deposit sync: ${formatDate(state.sync.wallets.deposit.lastCheckedAt)} | Withdrawal sync: ${formatDate(state.sync.wallets.withdrawal.lastCheckedAt)} | Telegram sync: ${formatDate(state.sync.telegram.lastCheckedAt)}.`;

  document.getElementById("depositSummaryGrid").innerHTML = [
    configRow("Address", short(state.config.depositWalletAddress, 12, 10)),
    configRow("Live USDT", formatAmount(depositSnapshot.tokenBalance)),
    configRow("Live BNB", formatAmount(depositSnapshot.nativeBalance, "BNB", 5)),
    configRow("Tracked tx count", state.depositTransactions.length),
    configRow("Matched Telegram rows", matchedMessages.length),
    configRow("Unmatched Telegram rows", unmatchedMessages.length),
  ].join("");

  document.getElementById("withdrawalSummaryGrid").innerHTML = [
    configRow("Address", short(state.config.withdrawalWalletAddress, 12, 10)),
    configRow("Live USDT", formatAmount(withdrawalSnapshot.tokenBalance)),
    configRow("Live BNB", formatAmount(withdrawalSnapshot.nativeBalance, "BNB", 5)),
    configRow("Tracked tx count", state.withdrawalTransactions.length),
    configRow("Latest chain block", withdrawalSnapshot.latestBlock ?? "-"),
    configRow("Wallet distinct", state.config.walletsAreDistinct ? "Yes" : "No"),
  ].join("");

  document.getElementById("depositTransactionsBody").innerHTML = state.depositTransactions
    .map((tx) => `
      <tr>
        <td>${formatDate(tx.timestamp)}</td>
        <td>${formatAmount(tx.amount)}</td>
        <td title="${tx.from}">${short(tx.from, 9, 7)}</td>
        <td><span class="badge ${tx.reconciliation?.status === "matched" ? "ok" : "warn"}">${tx.reconciliation?.status || "unmatched"}</span></td>
        <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank" rel="noreferrer">${short(tx.hash, 10, 8)}</a></td>
      </tr>
    `)
    .join("");

  document.getElementById("depositUnmatchedTransactionsBody").innerHTML = unmatchedDepositTransactions
    .map((tx) => `
      <tr>
        <td>${formatDate(tx.timestamp)}</td>
        <td>${formatAmount(tx.amount)}</td>
        <td title="${tx.from}">${short(tx.from, 9, 7)}</td>
        <td><span class="badge warn">${tx.reconciliation?.status || "unmatched"}</span></td>
        <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank" rel="noreferrer">${short(tx.hash, 10, 8)}</a></td>
      </tr>
    `)
    .join("");

  const filteredMessages = state.telegramMessages.filter((msg) => {
    if (telegramStatusFilter === "all") {
      return true;
    }
    return (msg.reconciliation?.status || "unmatched") === telegramStatusFilter;
  });
  document.getElementById("messagesBody").innerHTML = filteredMessages
    .map((msg) => {
      const status = msg.reconciliation?.status || "unmatched";
      return `
        <tr>
          <td>${formatDate(msg.timestamp)}</td>
          <td>${msg.sender || "-"}</td>
          <td>${formatAmount(msg.amount)}</td>
          <td>
            <span class="badge ${status === "matched" ? "ok" : "warn"}">${status}</span>
            <div class="chain-lines">
              <span>Origin: ${msg.reconciliation?.originTxHash ? `<a href="${msg.reconciliation.originTxUrl}" target="_blank" rel="noreferrer">${short(msg.reconciliation.originTxHash, 10, 8)}</a>` : "-"}</span>
              <span>Deposit: ${msg.reconciliation?.settlementTxHash ? `<a href="${msg.reconciliation.settlementTxUrl}" target="_blank" rel="noreferrer">${short(msg.reconciliation.settlementTxHash, 10, 8)}</a>` : "-"}</span>
              <span>Fees: ${msg.reconciliation?.feesTxHash ? `<a href="${msg.reconciliation.feesTxUrl}" target="_blank" rel="noreferrer">${short(msg.reconciliation.feesTxHash, 10, 8)}</a>` : "-"}</span>
              <span>Wallet landed: ${msg.reconciliation?.matchedTransactionHash ? formatAmount(msg.reconciliation.matchedTransactionAmount) : "No"}</span>
            </div>
            <p class="message-text">${msg.text || "-"}</p>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("withdrawalTransactionsBody").innerHTML = state.withdrawalTransactions
    .map((tx) => {
      const isOutgoing = tx.from === state.config.withdrawalWalletAddress;
      const counterparty = isOutgoing ? tx.to : tx.from;
      return `
        <tr>
          <td>${formatDate(tx.timestamp)}</td>
          <td>${formatAmount(tx.amount)}</td>
          <td>${isOutgoing ? "Outgoing to user / other wallet" : "Incoming top-up / receive"}</td>
          <td title="${counterparty}">${short(counterparty, 10, 8)}</td>
          <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank" rel="noreferrer">${short(tx.hash, 10, 8)}</a></td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("internalTransfersBody").innerHTML = state.interWalletTransfers
    .map((tx) => `
      <tr>
        <td>${formatDate(tx.timestamp)}</td>
        <td>${formatAmount(tx.amount)}</td>
        <td>${tx.from === state.config.depositWalletAddress ? "Deposit -> Withdrawal" : "Withdrawal -> Deposit"}</td>
        <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank" rel="noreferrer">${short(tx.hash, 10, 8)}</a></td>
      </tr>
    `)
    .join("");

  setView(activeView);
}

async function uploadTelegramExports(event) {
  event.preventDefault();
  const input = document.getElementById("telegramFiles");
  const button = document.getElementById("telegramUploadButton");
  const status = document.getElementById("uploadStatus");

  if (!input.files.length) {
    status.textContent = "Choose one or more Telegram export HTML files first.";
    return;
  }

  const formData = new FormData();
  for (const file of input.files) {
    formData.append("files", file);
  }

  button.disabled = true;
  button.textContent = "Uploading...";
  status.textContent = "Importing Telegram export files...";

  const response = await fetch("/audit-api/telegram/import", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  status.textContent = response.ok
    ? `Imported ${payload.imported} messages. Skipped ${payload.skipped || 0}. Total stored: ${payload.totalMessages}.`
    : (payload.error || "Upload failed.");

  await loadState();
  button.disabled = false;
  button.textContent = "Upload export files";
}

async function syncWallet(mode, buttonId, idleText, busyText) {
  const button = document.getElementById(buttonId);
  button.disabled = true;
  button.textContent = busyText;
  await fetch("/audit-api/sync/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  await loadState();
  button.disabled = false;
  button.textContent = idleText;
}

async function syncTelegram(mode, buttonId, idleText, busyText) {
  const button = document.getElementById(buttonId);
  button.disabled = true;
  button.textContent = busyText;
  await fetch("/audit-api/sync/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  await loadState();
  button.disabled = false;
  button.textContent = idleText;
}

document.getElementById("overviewViewButton").addEventListener("click", () => setView("overview"));
document.getElementById("depositViewButton").addEventListener("click", () => setView("deposit"));
document.getElementById("withdrawalViewButton").addEventListener("click", () => setView("withdrawal"));
document.getElementById("internalViewButton").addEventListener("click", () => setView("internal"));
document.getElementById("walletIncrementalSyncButton").addEventListener("click", async () => {
  await syncWallet("incremental", "walletIncrementalSyncButton", "Sync both wallets", "Syncing...");
});
document.getElementById("walletFullSyncButton").addEventListener("click", async () => {
  await syncWallet("full", "walletFullSyncButton", "Full wallet history", "Loading full...");
});
document.getElementById("telegramIncrementalSyncButton").addEventListener("click", async () => {
  await syncTelegram("incremental", "telegramIncrementalSyncButton", "Telegram refresh", "Refreshing...");
});
document.getElementById("telegramStatusFilter").addEventListener("change", (event) => {
  telegramStatusFilter = event.target.value;
  if (currentState) {
    render(currentState);
  }
});
document.getElementById("telegramUploadForm").addEventListener("submit", uploadTelegramExports);

loadState();
setInterval(loadState, 15000);
