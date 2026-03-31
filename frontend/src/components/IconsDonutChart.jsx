import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import React from "react";

export default function TokensDonutChart({ data }) {
  const COLORS = ["#38bdf8", "#34d399"]; // blue + green
  const [creditsUsed, setCreditsUsed] = React.useState(0);

  const chartData = (data || []).map(item => ({
    name: item.name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), // e.g. "tokens_input" -> "Tokens Input"
    value: item.value,
    
  }));
 
  data.forEach(item => {
    if (item.name === "credits_used") {
      setCreditsUsed(item.value);
    }
  });
//   const total = chartData.reduce((sum, item) => sum + item.value, 0);


  return (
    <div className="donut-wrapper">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}   // 🔥 reduced
            outerRadius={80}   // 🔥 reduced (main fix)
            paddingAngle={3}
            >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => value.toLocaleString()}
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="donut-center">
        <p>credits<br/>used<br/><b>${creditsUsed}</b></p>
        
      </div>
    </div>
  );
}