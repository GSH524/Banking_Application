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

  return (
    <span className="relative inline-flex items-center font-medium tracking-tight">
      {/* The typed text */}
      <span className="text-white">{display}</span>

      {/* The blinking cursor */}
      {i < text.length && (
        <span className="ml-1 inline-block w-1.5 h-5 bg-blue-500 animate-pulse rounded-full" />
      )}

      {/* Tailwind's built-in pulse is okay, but for a true 'typewriter' blink, 
          we can add a quick custom style below */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor {
          animation: blink 0.8s step-end infinite;
        }
      `}</style>
    </span>
  );
}