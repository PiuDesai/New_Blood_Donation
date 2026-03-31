import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logoutUser as apiLogout } from "../api/api";
import { dashboardPath } from "../utils/rolePaths";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const t = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedUser && t) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(t);
        } catch {
          localStorage.removeItem("user");
        }
      }
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProfile();
        const u = data.user;
        if (!cancelled && u) {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);

    const role = String(userData.role || "").toLowerCase();
    console.log("[Auth] login success, role:", role, "userId:", userData._id || userData.id);
    navigate(dashboardPath(role));
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setUser(null);
      setToken(null);
      navigate("/role-selection");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
