import { useState } from "react";
import testimonials from "../data/testimonialsData";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  const next = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <span className="testimonials-tag">TESTIMONIALS</span>
        <h2 style={{color:"white"}}>Loved by Thousands</h2>
        <p>
          Don't just take our word for it. Here's what our customers have to say.
        </p>
      </div>

      <div className="testimonial-card">
        <div className="stars">
          {"⭐".repeat(current.rating)}
        </div>

        <p className="testimonial-text">"{current.message}"</p>

        <div className="testimonial-user">
          <img src={current.image} alt={current.name} />
          <div>
            <h4 style={{color:"white"}}>{current.name}</h4>
            <span>{current.role}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="testimonial-controls">
        <button onClick={prev}>←</button>

        <div className="dots">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={i === index ? "dot active" : "dot"}
            />
          ))}
        </div>

        <button onClick={next}>→</button>
      </div>
    </section>
  );
}
