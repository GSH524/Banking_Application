export default function AdminStatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "16px",
        margin: "10px 0",
        borderRadius: "8px",
      }}
    >
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}
