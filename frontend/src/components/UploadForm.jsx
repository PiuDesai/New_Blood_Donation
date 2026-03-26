import React, { useState } from "react";
import { analyzeReport } from "../api/api";

const UploadForm = ({ setResult, setLoading }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);

    setLoading(true);

    try {
      const res = await analyzeReport(formData);
      setResult(res.data.result);
    } catch (err) {
      console.error(err);
      alert("Error uploading file: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file) => {
    if (!file) return null;
    if (file.type === "application/pdf") return "📄";
    if (file.type.startsWith("image/")) return "🖼️";
    return "📃";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .uf-root {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #0d0d0f;
          padding: 24px;
        }

        .uf-card {
          background: #131316;
          border: 1px solid #232329;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }

        .uf-header {
          margin-bottom: 32px;
        }

        .uf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 16px;
          font-family: 'DM Mono', monospace;
        }

        .uf-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 6px #6366f1;
          animation: uf-pulse 2s ease-in-out infinite;
        }

        @keyframes uf-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .uf-title {
          font-size: 22px;
          font-weight: 600;
          color: #f0f0f5;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .uf-subtitle {
          font-size: 13.5px;
          color: #5a5a6e;
          margin: 0;
          font-weight: 400;
        }

        .uf-dropzone {
          position: relative;
          border: 1.5px dashed #2a2a35;
          border-radius: 14px;
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #0f0f12;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .uf-dropzone:hover,
        .uf-dropzone.dragging {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.04);
        }

        .uf-dropzone.dragging::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 13px;
          box-shadow: inset 0 0 0 2px rgba(99, 102, 241, 0.4);
          pointer-events: none;
        }

        .uf-dropzone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .uf-icon-wrap {
          width: 52px;
          height: 52px;
          background: #1a1a22;
          border: 1px solid #2a2a38;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 22px;
          transition: transform 0.2s ease;
        }

        .uf-dropzone:hover .uf-icon-wrap {
          transform: scale(1.06);
        }

        .uf-drop-label {
          font-size: 14px;
          font-weight: 500;
          color: #c8c8d8;
          margin: 0 0 6px;
        }

        .uf-drop-hint {
          font-size: 12px;
          color: #42424f;
          margin: 0;
          font-family: 'DM Mono', monospace;
        }

        .uf-file-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #1a1a22;
          border: 1px solid #2a2a38;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 20px;
          animation: uf-slide-in 0.2s ease;
        }

        @keyframes uf-slide-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .uf-file-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .uf-file-info {
          flex: 1;
          min-width: 0;
        }

        .uf-file-name {
          font-size: 13px;
          font-weight: 500;
          color: #ddddf0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .uf-file-size {
          font-size: 11.5px;
          color: #5a5a6e;
          font-family: 'DM Mono', monospace;
          margin-top: 2px;
        }

        .uf-clear-btn {
          background: none;
          border: none;
          color: #4a4a5a;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1;
          transition: color 0.15s;
          flex-shrink: 0;
        }

        .uf-clear-btn:hover { color: #ef4444; }

        .uf-submit {
          width: 100%;
          padding: 14px;
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .uf-submit:hover {
          background: #4f52e0;
          box-shadow: 0 6px 28px rgba(99, 102, 241, 0.4);
          transform: translateY(-1px);
        }

        .uf-submit:active { transform: translateY(0); }

        .uf-submit:disabled {
          background: #2a2a38;
          color: #4a4a5a;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .uf-footer {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #3a3a48;
          font-size: 11.5px;
          font-family: 'DM Mono', monospace;
        }

        .uf-footer svg {
          opacity: 0.6;
        }
      `}</style>

      <div className="uf-root">
        <div className="uf-card">
          <div className="uf-header">
            <div className="uf-badge">AI Analysis</div>
            <h2 className="uf-title">Upload your report</h2>
            <p className="uf-subtitle">PDF, images, or plain text — we'll handle the rest.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Drop zone */}
            <div
              className={`uf-dropzone${isDragging ? " dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.txt,image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="uf-icon-wrap">
                {isDragging ? "📥" : "📂"}
              </div>
              <p className="uf-drop-label">
                {isDragging ? "Drop it here" : "Drag & drop or click to browse"}
              </p>
              <p className="uf-drop-hint">PDF · TXT · JPG · PNG · WEBP</p>
            </div>

            {/* File preview pill */}
            {file && (
              <div className="uf-file-pill">
                <span className="uf-file-icon">{getFileIcon(file)}</span>
                <div className="uf-file-info">
                  <div className="uf-file-name">{file.name}</div>
                  <div className="uf-file-size">{formatSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="uf-clear-btn"
                  onClick={() => setFile(null)}
                  title="Remove file"
                >✕</button>
              </div>
            )}

            <button type="submit" className="uf-submit" disabled={!file}>
              <span>Analyze Report</span>
              <span>→</span>
            </button>
          </form>

          <div className="uf-footer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Files are processed securely and not stored
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadForm;