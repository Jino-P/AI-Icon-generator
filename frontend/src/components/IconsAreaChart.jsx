import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function IconsAreaChart({ data }) {
  const chartData = (Array.isArray(data) ? data : []).map(item => ({
    ...item,
    value: Number(item.value) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        
        {/* Gradient */}
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {/* Grid */}
        <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

        {/* Axes */}
        <XAxis dataKey="name" stroke="#cbd5f5" />
        <YAxis stroke="#cbd5f5" />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
        />

        {/* Area */}
        <Area
          type="monotone"
          dataKey="value"
          stroke="#38bdf8"
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}