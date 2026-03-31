import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function IconsBarChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        
        <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

        <XAxis dataKey="date" stroke="#cbd5f5" />
        <YAxis stroke="#cbd5f5" />

        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <Bar
          dataKey="count"
          fill="#34d399"
          radius={[6, 6, 0, 0]}  // rounded bars 🔥
        />
      </BarChart>
    </ResponsiveContainer>
  );
}