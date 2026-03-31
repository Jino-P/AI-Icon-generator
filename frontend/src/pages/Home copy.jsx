import React from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import "../styles/Home.css";
import { useEffect, useState } from "react";
import IconsLineChart from "./IconsLineChart";
import IconsBarChart from "./IconsBarChart";

function Home() {
  usePageTitle("Dashboard");
  
  return (
    <div className="page-wrapper">
    <div className="home-container">
      <div className="hero-section">
        <h1>AI Icon Generator Dashboard</h1>
        <p>
          Generate intelligent, AI-powered app icons and manage your creations
          in one place.
        </p>

        <div className="hero-buttons">
          <button
            className="secondary-btn"
            onClick={() => (window.location.href = "/generate")}
          >
            Generate Icons
          </button>
          <button
            className="secondary-btn"
            onClick={() => (window.location.href = "/studio")}
          >
            Edit with AI
          </button> 

          <button
            className="secondary-btn"
            onClick={() => (window.location.href = "/gallery")}
          >
            View Gallery
          </button>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>AI Prompt Intelligence</h3>
          <p>
            Automatically generate optimized prompts based on app name,
            branding, and platform selection.
          </p>
        </div>

        <div className="feature-card">
          <h3>High-Quality Icon Generation</h3>
          <p>
            Create production-ready icons using AI image generation models.
          </p>
        </div>

        <div className="feature-card">
          <h3>Gallery Management</h3>
          <p>
            View, preview, and manage all generated assets stored securely in
            the system.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Home;
