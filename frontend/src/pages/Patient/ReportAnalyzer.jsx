import React, { useState } from "react";
import { analyzeReport } from "../../api/api";

const ReportAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [dragging, setDragging] = useState(false);

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file");
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
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Drag
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    // Copy
    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#ffffff",
                padding: "30px",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div style={{ width: "100%", maxWidth: "600px" }}>

                {/* Header */}
                <p style={{ color: "#666", marginBottom: "20px" }}>
                    Upload your Blood report for AI analysis
                </p>

                {/* Upload */}
                <form onSubmit={handleSubmit}>
                    <div
                        onClick={() => document.getElementById("fileInput").click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: dragging ? "2px dashed #dc2626" : "2px dashed #ccc",
                            background: "#fafafa",
                            padding: "40px",
                            textAlign: "center",
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "0.2s",
                        }}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            accept=".pdf,.txt,image/*"
                            style={{ display: "none" }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />

                        <div style={{ fontSize: "30px" }}>
                            {dragging ? "📥" : "📂"}
                        </div>

                        <p style={{ color: "#444", marginTop: "10px" }}>
                            Drag & drop or click to upload
                        </p>

                        <p style={{ fontSize: "12px", color: "#888" }}>
                            PDF · TXT · JPG · PNG
                        </p>
                    </div>

                    {/* File Preview */}
                    {file && (
                        <div
                            style={{
                                marginTop: "15px",
                                padding: "10px",
                                background: "#f5f5f5",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: "#333",
                            }}
                        >
                            <span>{file.name}</span>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={!file || loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading ? "#fca5a5" : "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            marginTop: "15px",
                            fontWeight: "600",
                        }}
                    >
                        {loading ? "Analyzing..." : "Analyze Report"}
                    </button>
                </form>

                {/* Result */}
                {result && (
                    <div
                        style={{
                            marginTop: "30px",
                            padding: "20px",
                            borderRadius: "12px",
                            background: "#ffffff",
                            border: "1px solid #eee",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h3 style={{ margin: 0, color: "#111" }}>📋 Analysis Result</h3>

                            <button
                                onClick={handleCopy}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd",
                                    cursor: "pointer",
                                    background: copied ? "#22c55e" : "#f3f3f3",
                                    color: copied ? "#fff" : "#333",
                                }}
                            >
                                {copied ? "Copied ✓" : "Copy"}
                            </button>
                        </div>

                        {/* Formatted Content */}
                        <div style={{ marginTop: "15px" }}>
                            {result.split("\n").map((line, index) => {
                                // Highlight abnormal keywords
                                const isAbnormal =
                                    line.toLowerCase().includes("low") ||
                                    line.toLowerCase().includes("high") ||
                                    line.toLowerCase().includes("below") ||
                                    line.toLowerCase().includes("above");

                                // Bullet points
                                if (line.trim().startsWith("-")) {
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                marginBottom: "8px",
                                                color: isAbnormal ? "#dc2626" : "#333",
                                                fontWeight: isAbnormal ? "500" : "400",
                                            }}
                                        >
                                            <span style={{ marginRight: "8px" }}>•</span>
                                            <span>{line.replace(/[-*]/g, "").trim()}</span>
                                        </div>
                                    );
                                }

                                // Normal paragraph
                                return (
                                    <p
                                        key={index}
                                        style={{
                                            marginTop: "12px",
                                            lineHeight: "1.6",
                                            color: "#444",
                                        }}
                                    >
                                        {line}
                                    </p>
                                );
                            })}
                        </div>

                        {/* Disclaimer */}
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "10px",
                                background: "#fff5f5",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#dc2626",
                                border: "1px solid #fecaca",
                            }}
                        >
                            ⚠️ This is AI-generated. Consult a doctor before making decisions.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportAnalyzer;