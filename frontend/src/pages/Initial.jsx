import React from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import "../styles/Initial.css";

function Landing() {
  usePageTitle("AI Icon Generator");

  return (
    <div className="landing-container compact">

      <div className="landing-hero compact">

        {/* LEFT */}
        <div className="landing-content">
          <h1 className="landing-title blue">
            AI Icon Generator
          </h1>

          <p className="landing-subtitle">
            Generate high-quality app icons instantly using AI.
            Simple, fast, and production-ready.
          </p>

          <div className="landing-buttons">
            <button
              className="primary-btn blue"
              onClick={() => (window.location.href = "/register")}
            >
              Get Started
            </button>

            <button
              className="secondary-btn"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
          </div>
        
        </div>

        {/* RIGHT */}
        <div className="landing-graphic">
          <img
            src="/ai_landing.png"
            alt="AI icons"
          />
        </div>

      </div>

      {/* MINI FEATURES (INLINE) */}
      <div className="mini-features">
        <div>⚡ Fast Generation</div>
        <div>🎨 Multiple Styles</div>
        <div>📦 Export Ready</div>
      </div>

    </div>
  );
}

export default Landing;