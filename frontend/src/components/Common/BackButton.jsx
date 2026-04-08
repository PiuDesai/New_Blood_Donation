import React from "react";

const BackButton = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <button
      onClick={handleGoBack}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
        transition: "all 0.2s ease",
        zIndex: 1000,
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = "#b91c1c";
        e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.4)";
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = "#dc2626";
        e.target.style.boxShadow = "0 2px 8px rgba(220, 38, 38, 0.3)";
      }}
    >
      ← Back
    </button>
  );
};

export default BackButton;
