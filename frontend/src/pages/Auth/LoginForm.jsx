import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authAPI";

const LoginForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate(`/${res.data.user.role}`);
      if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate(`/${role}`);
        }

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-pink-500 to-orange-400">

      <div className="bg-white w-[380px] p-8 rounded-2xl shadow-2xl">

        <h2 className="text-xl font-bold text-center mb-2">
          Login as {role}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-red-500 text-white rounded-lg"
        >
          Sign In
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-red-500 cursor-pointer"
          >
            Register
          </span>
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-3 text-xs text-gray-500"
        >
          ← Back
        </button>

      </div>
    </div>
  );
};

export default LoginForm;