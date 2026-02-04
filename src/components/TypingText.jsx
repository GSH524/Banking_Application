import { useEffect, useState } from "react";

export default function TypingText({ text, speed = 40 }) {
  const [display, setDisplay] = useState("");
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i < text.length) {
      const t = setTimeout(() => {
        setDisplay((prev) => prev + text[i]);
        setI((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(t);
    }
  }, [i, text, speed]);

  return <span>{display}</span>;
}
