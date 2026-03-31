import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import api from "../services/api";
import "../styles/Login.css";

function Login() {
  usePageTitle("Sign In");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");

      if (!username.trim() || !password.trim()) {
        setError("Please enter username and password.");
        return;
      }

      setLoading(true);

      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error("Token not received");
      }

      // ✅ Store token correctly
      localStorage.setItem("access_token", access_token);

      // Optional: store username
      localStorage.setItem("username", username);

      navigate("/home");

    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Branding Section */}
        <div className="login-left">
          <h1>AI Icon Generator</h1>
          <p>
            Create premium, brand-aligned app icons instantly using AI-powered
            automation.
          </p>
          <ul>
            <li>✔ Smart prompt generation</li>
            <li>✔ Secure user authentication</li>
            <li>✔ Personalized icon dashboard</li>
            <li>✔ Instant image downloads</li>
          </ul>
        </div>

        {/* Right Login Card */}
        <div className="login-card">
          {/* <h2>Welcome Back</h2> */}
          <img
            src="/Recode_Logo_2026.jpg"
            alt="AI Icon Generator Logo"
            className="login-logo"
          />
          <p className="login-subtitle">
            Sign in to continue to your dashboard
          </p>

          {error && <div className="error-message">{error}</div>}

          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="login-footer">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Create Account
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;