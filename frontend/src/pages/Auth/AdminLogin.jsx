import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import BackButton from "../../components/Common/BackButton";
import BloodMatrixLogo from "../../components/Common/BloodMatrixLogo";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
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
    <>
      <BackButton />
      <BloodMatrixLogo />
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

            <div style={styles.passwordContainer}>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                onChange={handleChange}
                required
                style={{ ...styles.input, paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeButton}
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" style={styles.button}>
              Login
            </button>
            
            <div style={styles.forgotPasswordContainer}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                style={styles.forgotPasswordLink}
              >
                {forgotPasswordLoading ? "Sending..." : "Forgot Password?"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
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
  passwordContainer: {
    position: "relative",
    width: "100%",
    margin: "10px 0",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#666",
    padding: "5px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  forgotPasswordContainer: {
    textAlign: "right",
    marginTop: "10px",
  },
  forgotPasswordLink: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "12px",
    textDecoration: "underline",
    padding: "5px",
    opacity: 1,
    transition: "opacity 0.3s",
  },
};

export default AdminLogin;