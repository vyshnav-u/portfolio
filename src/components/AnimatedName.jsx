
import React, { useEffect, useState } from "react";

function AnimatedName() {
  const names = [
  ["FULL STACK", "DEVELOPER"],
  ["FRONTEND", "DEVELOPER"],
  ["BACKEND", "DEVELOPER"],
  ["WEB", "DEVELOPER"],
  ["CREATIVE", "CODER"],
];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % names.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-center text-[18vw] font-bold leading-[0.78] tracking-[-0.075em] md:text-[15vw]">
      <span className="block">{names[currentIndex][0]}</span>
      <span className="block">{names[currentIndex][1]}</span>
    </h1>
  );
}

export default AnimatedName;
