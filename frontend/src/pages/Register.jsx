import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import api from "../services/api";
import "../styles/Register.css";

function Register() {
  usePageTitle("Create Account");
  
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError("");
    setMessage("");

    if (!form.username || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password
      });

      setMessage("Registration successful 🎉 Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      if (err.response?.data?.detail) {
    const detail = err.response.data.detail;

    if (Array.isArray(detail)) {
      setError(detail[0].msg);   // extract validation message
    } else {
      setError(detail);          // simple string error
    }
  } else {
    setError("Registration failed.");
  }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* <h2>Create Account</h2> */}
        <img
          src="/Recode_Logo_2026.jpg"
          alt="AI Icon Generator Logo"
          className="auth-logo"
        />
        <p className="auth-subtitle">
          Join the AI Icon Generator platform
        </p>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        <button className="primary-btn" onClick={handleRegister}>
          Register
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => (window.location.href = "/login")}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
