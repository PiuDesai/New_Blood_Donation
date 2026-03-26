import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";

const Home = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .home-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0d0d0f;
          color: #f0f0f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }

        /* Subtle radial glow at top */
        .home-root::before {
          content: '';
          position: fixed;
          top: -180px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(220, 38, 38, 0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .home-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        /* ── Header ── */
        .home-header {
          text-align: center;
          animation: fade-down 0.5s ease both;
        }

        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .home-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%);
          border: 1px solid rgba(220, 38, 38, 0.35);
          font-size: 26px;
          margin-bottom: 18px;
          box-shadow: 0 8px 32px rgba(220, 38, 38, 0.2);
        }

        .home-title {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #f5f5f8;
          margin-bottom: 8px;
        }

        .home-title span {
          color: #ef4444;
        }

        .home-desc {
          font-size: 14px;
          color: #4a4a5e;
          font-weight: 400;
          line-height: 1.5;
        }

        /* Step tracker */
        .home-steps {
          display: flex;
          align-items: center;
          gap: 0;
          animation: fade-down 0.5s 0.1s ease both;
          width: 100%;
          justify-content: center;
        }

        .home-step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-family: 'DM Mono', monospace;
          color: #3a3a4e;
          transition: color 0.3s;
        }

        .home-step.active { color: #ef4444; }
        .home-step.done   { color: #22c55e; }

        .home-step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .home-step-line {
          flex: 1;
          height: 1px;
          background: #232329;
          margin: 0 10px;
          max-width: 60px;
        }

        /* Upload section */
        .home-upload-wrap {
          width: 100%;
          animation: fade-up 0.5s 0.15s ease both;
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .home-loader-wrap {
          width: 100%;
          animation: fade-up 0.35s ease both;
        }

        .home-result-wrap {
          width: 100%;
          animation: fade-up 0.4s ease both;
        }

        /* Footer */
        .home-footer {
          margin-top: 16px;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          color: #2e2e3a;
          letter-spacing: 0.04em;
          text-align: center;
        }
      `}</style>

      <div className="home-root">
        <div className="home-inner">

          {/* Header */}
          <div className="home-header">
            <div className="home-logo">🩸</div>
            <h1 className="home-title">Blood Report <span>Analyzer</span></h1>
            <p className="home-desc">Upload your lab report and get an instant AI-powered breakdown of your results.</p>
          </div>

          {/* Step tracker */}
          <div className="home-steps">
            <div className={`home-step ${!result && !loading ? "active" : "done"}`}>
              <div className="home-step-num">{result || loading ? "✓" : "1"}</div>
              Upload
            </div>
            <div className="home-step-line" />
            <div className={`home-step ${loading ? "active" : result ? "done" : ""}`}>
              <div className="home-step-num">{result ? "✓" : "2"}</div>
              Analyze
            </div>
            <div className="home-step-line" />
            <div className={`home-step ${result ? "done" : ""}`}>
              <div className="home-step-num">{result ? "✓" : "3"}</div>
              Results
            </div>
          </div>

          {/* Upload form */}
          <div className="home-upload-wrap">
            <UploadForm setResult={setResult} setLoading={setLoading} />
          </div>

          {/* Loader */}
          {loading && (
            <div className="home-loader-wrap">
              <Loader />
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="home-result-wrap">
              <ResultCard result={result} />
            </div>
          )}

          <div className="home-footer">HIPAA-conscious · AI-assisted · Not a substitute for medical advice</div>
        </div>
      </div>
    </>
  );
};

export default Home;