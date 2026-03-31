import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/admin/login",
        form
      );

      if (res.data.success) {
        localStorage.setItem("adminAuth", "true");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eef2f7",
  },
  card: {
    padding: "30px",
    background: "#fff",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default AdminLogin;