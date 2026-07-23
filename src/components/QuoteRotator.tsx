"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "Arise, awake, and stop not till the goal is reached.",
  "All power is within you; you can do anything and everything.",
  "In a conflict between the heart and the brain, follow your heart.",
  "They alone live who live for others; the rest are more dead than alive.",
  "Take up one idea. Make that one idea your life.",
  "Strength is life, weakness is death.",
];

export default function QuoteRotator() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 600);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p
      className="italic text-lg md:text-xl leading-relaxed"
      style={{
        fontFamily: "Cormorant Garamond, serif",
        color: "#D9CBBA",
        fontWeight: 500,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
        minHeight: "3.5rem",
      }}
    >
      &ldquo;{QUOTES[index]}&rdquo;
    </p>
  );
}
