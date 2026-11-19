import React, { useEffect, useState } from "react";

const images = [
  { src: "/projects/E-FIT/EFIT Home.png", name: "EFIT Home page" },

  { src: "/projects/PRODUCT PAGE/PRODUCT Home.png", name: "Landing Page" },
  { src: "/projects/BOOKSTORE/BOOSTORE Home.png", name: "Landing Page" },
  { src: "/projects/RETRO/RETRO Hero.png", name: "RETRO Hero Design" },
  { src: "/projects/BOOKSTORE/BOOKSTORE Footer.png", name: "Book Store Footer" },
  { src: "/projects/RETRO/RETRO About.png", name: "Typography Study" },
];

const SPREAD = 20; // px the left/right images move away from the hovered one

// Repeat the set so ONE group is wider than the screen,
// then render two groups for the seamless loop
const REPEAT = 4;
const group = Array.from({ length: REPEAT }).flatMap(() => images);
const loop = [...group, ...group];

function DesignShowcase() {
  const [selected, setSelected] = useState(null); // { src, name }
  const [hovered, setHovered] = useState(null); // index inside the looped list

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const getShift = (i) => {
    if (hovered === null || i === hovered) return 0;
    return i < hovered ? -SPREAD : SPREAD;
  };

  return (
    <>
      <style>{`
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .marquee-track {
          animation: marquee-right 120s linear infinite;
        }
        .marquee:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Strip */}
      <div
        className="marquee overflow bg-[#f8f5ef] md:pt-10"
        onMouseLeave={() => setHovered(null)}
      >
        <div className="marquee-track flex w-max items-end">
          {loop.map((item, i) => {
            const isHovered = i === hovered;

            return (
              <button
                key={i}
                onMouseEnter={() => setHovered(i)}
                onClick={() => setSelected(item)}
                className="relative mr-1 w-28 shrink-0 cursor-pointer text-left transition-transform duration-500 ease-out focus:outline-none md:w-36"
                style={{ transform: `translateX(${getShift(i)}px)` }}
              >
                {/* Label on top (absolute, so it never changes the item width) */}
                <div
                  className={`pointer-events-none absolute bottom-full left-0 pb-4 whitespace-nowrap text-[10px] tracking-[0.2em] text-[#140605] transition-all duration-500 md:text-sm ${isHovered
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                    }`}
                >
                  {item.name}
                </div>

                {/* Image */}
                <img
                  src={item.src}
                  alt={item.name}
                  draggable={false}
                  className={`block h-auto w-full origin-bottom border border-10 transition-all duration-500 ease-out ${isHovered
                    ? "scale-110 border-[#e0301e] opacity-100"
                    : hovered !== null
                      ? "scale-100 border-[#140605]/30 opacity-60"
                      : "scale-100 border-[#140605]/30 opacity-100"
                    }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4 md:p-10"
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute right-5 top-5 text-3xl leading-none text-white/80 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="text-xs uppercase tracking-[0.25em] text-white/80 md:text-sm">
            {selected.name}
          </div>

          <img
            src={selected.src}
            alt={selected.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}

export default DesignShowcase;