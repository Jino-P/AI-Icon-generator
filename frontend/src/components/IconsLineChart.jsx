import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function IconsLineChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        
        {/* Grid (subtle lines) */}
        <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

        {/* Axes */}
        <XAxis dataKey="date" stroke="#cbd5f5" tick={{ fontSize: 12 }} />
        <YAxis stroke="#cbd5f5" tick={{ fontSize: 12 }} />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
        />

        {/* Line */}
        <Line
          type="monotone"
          dataKey="count"
          stroke="#38bdf8"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}