import React, { useState } from "react";

const ResultCard = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .rc-card {
          font-family: 'DM Sans', sans-serif;
          background: #131316;
          border: 1px solid #232329;
          border-radius: 20px;
          overflow: hidden;
          width: 100%;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          animation: rc-in 0.4s ease both;
        }

        @keyframes rc-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Top accent bar */
        .rc-accent {
          height: 3px;
          background: linear-gradient(90deg, #ef4444, #f97316, #ef4444);
          background-size: 200% 100%;
          animation: rc-shimmer 3s linear infinite;
        }

        @keyframes rc-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .rc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid #1e1e26;
        }

        .rc-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rc-icon {
          width: 34px;
          height: 34px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .rc-title {
          font-size: 14px;
          font-weight: 600;
          color: #e0e0f0;
          letter-spacing: -0.01em;
        }

        .rc-subtitle {
          font-size: 11px;
          color: #3e3e50;
          font-family: 'DM Mono', monospace;
          margin-top: 1px;
        }

        .rc-actions {
          display: flex;
          gap: 8px;
        }

        .rc-action-btn {
          background: #1c1c24;
          border: 1px solid #2a2a38;
          border-radius: 8px;
          color: #5a5a72;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .rc-action-btn:hover {
          background: #232330;
          color: #c8c8e0;
          border-color: #38384a;
        }

        .rc-action-btn.copied {
          color: #22c55e;
          border-color: rgba(34,197,94,0.3);
          background: rgba(34,197,94,0.06);
        }

        .rc-body {
          padding: 20px 22px;
        }

        .rc-content {
          white-space: pre-line;
          color: #b0b0c8;
          font-size: 14px;
          line-height: 1.75;
          font-weight: 400;
        }

        .rc-divider {
          height: 1px;
          background: #1e1e26;
          margin: 0 22px;
        }

        .rc-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 22px 18px;
          background: rgba(239, 68, 68, 0.03);
        }

        .rc-disclaimer-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
          margin-top: 1px;
          color: #ef4444;
          font-weight: 700;
        }

        .rc-disclaimer-text {
          font-size: 12px;
          color: #5a3a3a;
          font-style: italic;
          line-height: 1.5;
        }

        .rc-disclaimer-text strong {
          color: #9a4a4a;
          font-style: normal;
          font-weight: 600;
        }
      `}</style>

      <div className="rc-card">
        <div className="rc-accent" />

        <div className="rc-header">
          <div className="rc-title-group">
            <div className="rc-icon">📋</div>
            <div>
              <div className="rc-title">Analysis Result</div>
              <div className="rc-subtitle">AI-generated · Review with your doctor</div>
            </div>
          </div>
          <div className="rc-actions">
            <button className={`rc-action-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
              {copied ? "✓ Copied" : "⧉ Copy"}
            </button>
          </div>
        </div>

        <div className="rc-body">
          <div className="rc-content">{result}</div>
        </div>

        <div className="rc-divider" />

        <div className="rc-disclaimer">
          <div className="rc-disclaimer-icon">!</div>
          <p className="rc-disclaimer-text">
            <strong>Medical disclaimer:</strong> This analysis is AI-generated and intended for informational purposes only. Always consult a qualified healthcare professional before making any medical decisions.
          </p>
        </div>
      </div>
    </>
  );
};

export default ResultCard;