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
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        lineHeight: "1",
        fontWeight: "500",
        transform: "translateX(-1px)",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
        transition: "all 0.2s ease",
        zIndex: 9999,
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = "#b91c1c";
        e.target.style.boxShadow = "0 3px 8px rgba(220, 38, 38, 0.35)";
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = "#dc2626";
        e.target.style.boxShadow = "0 2px 6px rgba(220, 38, 38, 0.25)";
      }}
    >
      ←
    </button>
  );
};

export default BackButton;
