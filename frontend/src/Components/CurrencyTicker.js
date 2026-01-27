// src/Components/CurrencyTicker.js
import React, { useEffect, useRef } from "react";

const assets = [
  { label: "XAUUSD", symbol: "OANDA:XAUUSD" },
  { label: "XAGUSD", symbol: "OANDA:XAGUSD" },
  { label: "EURUSD", symbol: "OANDA:EURUSD" },
  { label: "GBPUSD", symbol: "OANDA:GBPUSD" },
  { label: "XCUUSD", symbol: "OANDA:XCUUSD" },
  { label: "BTCUSD", symbol: "COINBASE:BTCUSD" },
  { label: "ETHUSD", symbol: "COINBASE:ETHUSD" },
];

export default function CurrencyTicker() {
  const tvRefs = useRef([]);

  useEffect(() => {
    tvRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbol: assets[idx % assets.length].symbol,
        width: "100%",
        isTransparent: true,
        colorTheme: "dark",
        locale: "en",
        showSymbolLogo: false,
      });
      el.appendChild(script);
    });
  }, []);

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        padding: "40px 20px 60px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <h3
        style={{
          fontSize: "22px",
          color: "var(--fx-accent)",
          fontWeight: "700",
          marginBottom: "14px",
          textAlign: "center",
          marginLeft: "auto",
          marginRight: "auto",
          width: "fit-content",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Live Trading
      </h3>

      <div
        style={{
          marginTop: "10px",
          overflow: "hidden",
          position: "relative",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            gap: "12px",
            animation: "marquee 22s linear infinite",
            padding: "8px 0 6px",
          }}
        >
          {[...assets, ...assets, ...assets].map((asset, idx) => (
            <div
              key={`${asset.symbol}-${idx}`}
              style={{
                flex: "0 0 210px",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid rgba(31, 215, 255, 0.35)",
                background: "linear-gradient(145deg, rgba(6, 14, 28, 0.78), rgba(10, 20, 36, 0.6))",
                boxShadow: "0 10px 20px rgba(2, 8, 18, 0.4)",
                overflow: "hidden",
              }}
            >
              <div
                ref={(el) => {
                  tvRefs.current[idx] = el;
                }}
                style={{
                  minHeight: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "scale(0.9)",
                  transformOrigin: "center center",
                  filter: "drop-shadow(0 0 10px rgba(31, 215, 255, 0.2))",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
