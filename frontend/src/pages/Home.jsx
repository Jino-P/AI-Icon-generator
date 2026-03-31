import React, { useEffect, useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import "../styles/Home.css";
import IconsLineChart from "../components/IconsLineChart";
import IconsBarChart from "../components/IconsBarChart";
import IconsAreaChart from "../components/IconsAreaChart";
import TokensDonutChart from "../components/IconsDonutChart";
import KpiGrid from "../components/IconsKpiGrid";
import api from "../services/api";

function Home() {
  usePageTitle("Dashboard");

  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [creditsData, setCreditsData] = useState([]);
  const [usageSplitData, setUsageSplitData] = useState([]);
  const [usageSummary, setUsageSummary] = useState([]);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const weeklyRes = await api.get("/api/dashboard/icons?range=weekly");
      const monthlyRes = await api.get("/api/dashboard/icons?range=monthly");
      const creditsRes = await api.get("/api/dashboard/credits-usage");
      const usageSplitRes = await api.get("/api/dashboard/usage-split");
      const usageSummaryRes = await api.get("/api/dashboard/usage-summary");

      // const weekly = await weeklyRes.json();
      // const monthly = await monthlyRes.json();
      // console.log("Weekly Data:", weeklyRes.data);
      // console.log("Monthly Data:", monthlyRes.data);
      // console.log("Credits Data:", creditsRes.data);
      // console.log("Usage Split Data:", usageSplitRes.data);
      console.log("Usage Summary Data:", usageSummaryRes.data);

      setWeeklyData(weeklyRes.data);
      setMonthlyData(monthlyRes.data);
      setCreditsData(creditsRes.data);
      setUsageSplitData(usageSplitRes.data);
      setUsageSummary(usageSummaryRes.data);
    } catch (err) {
      console.error(err);
    }
  };

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
            <div className="chart-card">
              <h4>Weekly Activity</h4>
              <IconsLineChart data={weeklyData} />
            </div>
          </div>

          {/* {/* <div className="feature-card">
            <div className="chart-card">
              <h4>Monthly Volume</h4>
              <IconsBarChart data={monthlyData} />
            </div> */}
          {/* </div> */} 
          <div className="feature-card">
            <div className="chart-card">
              <h4>Usage Summary</h4>
              <TokensDonutChart data={usageSummary} />
            </div>
          </div>

        <div className="feature-card">
            <div className="chart-card">
              <h4>Credits Usage</h4>
              <IconsAreaChart data={creditsData} />
            </div>
          </div>
          {/* <div className="feature-card">
            <div className="chart-card">
              <h4>credits usage</h4>
              <div className="metrics-grid">
                {creditsData.map((item, index) => (
                  <div key={index} className="metric-card">
                    <p className="metric-title">{item.name}</p>
                    <h3 className="metric-value">
                      {item.value.toFixed(4)}
                    </h3>
                  </div>
                ))}
              </div>
            </div> */}
          {/* </div> */}
        </div>
      </div>
      </div>
  );
}

export default Home;