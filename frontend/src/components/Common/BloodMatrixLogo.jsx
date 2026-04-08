import React from "react";

const BloodMatrixLogo = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        zIndex: 1000,
      }}
      onClick={() => window.location.href = "/"}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#dc2626",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "900",
          boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
        }}
      >
        B
      </div>
      <span
        style={{
          fontSize: "20px",
          fontWeight: "900",
          color: "#1f2937",
          letterSpacing: "-0.025em",
        }}
      >
        BloodMatrix
      </span>
    </div>
  );
};

export default BloodMatrixLogo;
