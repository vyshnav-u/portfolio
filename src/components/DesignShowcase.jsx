import React, { useEffect, useState } from "react";

const images = [
  { src: "/projects/E-FIT/EFIT Home.png", name: "EFIT Home page" },

  { src: "/projects/PRODUCT PAGE/PRODUCT Home.png", name: "Landing Page" },
  { src: "/projects/BOOKSTORE/BOOSTORE Home.png", name: "Landing Page" },
  { src: "/projects/RETRO/RETRO Hero.png", name: "RETRO Hero Design" },
  { src: "/projects/BOOKSTORE/BOOKSTORE Footer.png", name: "Book Store Footer" },
  { src: "/projects/RETRO/RETRO About.png", name: "Typography Study" },
];

const SPREAD = 20; // px the left/right images move away from the hovered one (mouse only)

// Repeat the set so ONE group is wider than the screen,
// then render two groups for the seamless loop
const REPEAT = 4;
const group = Array.from({ length: REPEAT }).flatMap(() => images);
const loop = [...group, ...group];

function DesignShowcase() {
  const [selected, setSelected] = useState(null); // { src, name }
  const [hovered, setHovered] = useState(null); // index inside the looped list (mouse only)
  const [paused, setPaused] = useState(false); // true while a finger is on the strip

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
        /* pause on hover only for real mouse devices, so it never "sticks" after a tap */
        @media (hover: hover) {
          .marquee:hover .marquee-track {
            animation-play-state: paused;
          }
        }
        /* reduced motion: stop the auto scroll and let people swipe the strip instead */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .marquee { overflow-x: auto; }
        }
      `}</style>

      {/* Strip. overflow-x-clip hides the sideways overflow (no page scrollbar on phones)
          but still lets the hover label sit above the images. */}
      <div
        className="marquee overflow-x-clip bg-[#f8f5ef] py-4 md:pb-0 md:pt-10"
        onPointerLeave={() => setHovered(null)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onTouchCancel={() => setPaused(false)}
      >
        <div
          className="marquee-track flex w-max items-end"
          style={{ animationPlayState: paused ? "paused" : undefined }}
        >
          {loop.map((item, i) => {
            const isHovered = i === hovered;

            return (
              <button
                key={i}
                type="button"
                aria-label={`Open ${item.name}`}
                // only a real mouse sets the hover state; touch taps are ignored here
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                onClick={() => setSelected(item)}
                className="relative mr-1 w-28 shrink-0 cursor-pointer text-left transition-transform duration-500 ease-out focus:outline-none sm:w-32 md:w-36"
                style={{ transform: `translateX(${getShift(i)}px)` }}
              >
                {/* Label on top: desktop only (phones show the name in the viewer instead) */}
                <div
                  className={`pointer-events-none absolute bottom-full left-0 hidden pb-4 whitespace-nowrap text-sm tracking-[0.2em] text-[#140605] transition-all duration-500 md:block ${
                    isHovered
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  {item.name}
                </div>

                {/* Image: thinner border on phones so small thumbnails aren't swallowed by it */}
                <img
                  src={item.src}
                  alt={item.name}
                  draggable={false}
                  className={`block h-auto w-full origin-bottom select-none border-[4px] transition-all duration-500 ease-out md:border-[10px] ${
                    isHovered
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:p-10"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center text-3xl leading-none text-white/80 hover:text-white md:right-5 md:top-5"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="px-12 text-center text-xs uppercase tracking-[0.25em] text-white/80 md:text-sm">
            {selected.name}
          </div>

          <img
            src={selected.src}
            alt={selected.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[75vh] max-w-full object-contain md:max-h-[80vh]"
          />
        </div>
      )}
    </>
  );
}

export default DesignShowcase;
