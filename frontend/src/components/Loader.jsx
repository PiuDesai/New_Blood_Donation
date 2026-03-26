import React, { useEffect, useState } from "react";

const STEPS = [
  "Reading report structure...",
  "Identifying biomarkers...",
  "Cross-referencing reference ranges...",
  "Generating your analysis...",
];

const Loader = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');

        .ld-wrap {
          font-family: 'DM Sans', sans-serif;
          background: #131316;
          border: 1px solid #232329;
          border-radius: 20px;
          padding: 32px 28px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          animation: ld-in 0.3s ease both;
        }

        @keyframes ld-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* DNA helix spinner */
        .ld-spinner-wrap {
          position: relative;
          width: 56px;
          height: 56px;
        }

        .ld-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          animation: ld-spin 1.4s linear infinite;
        }

        .ld-ring-outer {
          border-top-color: #ef4444;
          border-right-color: rgba(239, 68, 68, 0.2);
        }

        .ld-ring-mid {
          inset: 8px;
          border-top-color: transparent;
          border-bottom-color: #f97316;
          animation-direction: reverse;
          animation-duration: 1.8s;
        }

        .ld-ring-inner {
          inset: 16px;
          border-left-color: #ef4444;
          border-top-color: rgba(239, 68, 68, 0.15);
          animation-duration: 2.2s;
        }

        .ld-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
          animation: ld-beat 1.4s ease-in-out infinite;
        }

        @keyframes ld-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes ld-beat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50%       { transform: translate(-50%, -50%) scale(0.6); opacity: 0.5; }
        }

        /* Progress bar */
        .ld-bar-track {
          width: 100%;
          height: 2px;
          background: #1e1e26;
          border-radius: 2px;
          overflow: hidden;
        }

        .ld-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f97316);
          border-radius: 2px;
          animation: ld-progress 7.2s ease-in-out infinite;
        }

        @keyframes ld-progress {
          0%   { width: 0%; }
          80%  { width: 90%; }
          100% { width: 90%; }
        }

        .ld-text-group {
          text-align: center;
        }

        .ld-label {
          font-size: 14px;
          font-weight: 500;
          color: #c8c8e0;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }

        .ld-step {
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          color: #3e3e52;
          min-height: 16px;
          transition: opacity 0.3s ease;
        }

        /* Step dots */
        .ld-dots {
          display: flex;
          gap: 6px;
        }

        .ld-dot-step {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #232330;
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .ld-dot-step.active {
          background: #ef4444;
          transform: scale(1.3);
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
        }

        .ld-dot-step.done {
          background: #3d3d50;
        }
      `}</style>

      <div className="ld-wrap">
        {/* Spinner */}
        <div className="ld-spinner-wrap">
          <div className="ld-ring ld-ring-outer" />
          <div className="ld-ring ld-ring-mid" />
          <div className="ld-ring ld-ring-inner" />
          <div className="ld-dot" />
        </div>

        {/* Progress bar */}
        <div className="ld-bar-track" style={{ width: "100%" }}>
          <div className="ld-bar-fill" />
        </div>

        {/* Text */}
        <div className="ld-text-group">
          <p className="ld-label">Analyzing your report</p>
          <p className="ld-step">{STEPS[stepIndex]}</p>
        </div>

        {/* Step dots */}
        <div className="ld-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`ld-dot-step ${i === stepIndex ? "active" : i < stepIndex ? "done" : ""}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Loader;