export default function KpiGrid({ data }) {
  const labelMap = {
    tokens_input: "Input Tokens",
    tokens_output: "Output Tokens",
    total_tokens: "Total Tokens",
    credits_used: "Credits Used",
    images_generated: "Images Generated",
  };

  const formatValue = (name, value) => {
    if (name === "credits_used") return `$${value.toFixed(4)}`;
    if (name.includes("tokens")) return value.toLocaleString();
    return value;
  };

  return (
    <div className="kpi-grid">
      {data.map((item, index) => (
        <div key={index} className="kpi-card">
          <p className="kpi-label">{labelMap[item.name]}</p>
          <h2 className="kpi-value">
            {formatValue(item.name, item.value)}
          </h2>
        </div>
      ))}
    </div>
  );
}