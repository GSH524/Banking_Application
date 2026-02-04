import { useParams, Link } from "react-router-dom";
import features from "../data/featuresData";

export default function FeatureDetail() {
  const { id } = useParams();
  const feature = features.find((f) => f.id === id);

  if (!feature) {
    return <h2 style={{ padding: "40px" }}>Feature not found</h2>;
  }

  return (
    <div style={{ padding: "80px 40px",}}>
      <Link to="/" className="learn-more"> <span style={{color:"yellow"}}>← Back</span> </Link>

      <h1 style={{ marginTop: "20px" }}>{feature.title}</h1>
      <p style={{ maxWidth: "600px", marginTop: "10px" }}>
        {feature.description}
      </p>
    </div>
  );
}
