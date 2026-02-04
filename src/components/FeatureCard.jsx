import { Link } from "react-router-dom";

export default function FeatureCard({ id, title, description, icon, path }) {
  return (
    <div className="feature-card glass">
      <div className="feature-icon-glass">{icon}</div>

      <h3>{title}</h3>
      <p>{description}</p>

      <Link to={path} className="learn-more-glass">
        Learn more →
      </Link>
    </div>
  );
}
