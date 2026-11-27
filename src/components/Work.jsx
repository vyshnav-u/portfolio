import React, { useEffect, useRef, useState } from "react";

const BG = "#f8f5ef";
const ACCENT = "#140605";

const STAY_VH = 5; // extra pinned scroll per project (desktop only). Higher = the section stays longer

const projects = [
  {
    id: 1,
    name: "BookStore Page",
    category: "Web",
    link: "https://github.com/vyshnav-u/bookstore-frontend",
    img: "/projects/BOOKSTORE/BOOSTORE Home.png",
    gallery: [
      "/projects/BOOKSTORE/BOOSTORE Home.png",
      "/projects/BOOKSTORE/BOOKSTORE Footer.png",
    ],
  },
  {
    id: 2,
    name: "E-Fit Fitness Training Page",
    category: "Web",
    link: "https://github.com/vyshnav-u/E-FIT-frontend",
    img: "/projects/E-FIT/EFIT Home.png",
    gallery: [
      "/projects/E-FIT/EFIT Home.png",
      "/projects/E-FIT/EFIT List.png",
      "/projects/E-FIT/EFIT Footer.png",
    ],
  },
  {
    id: 3,
    name: "Retro Casette Page",
    category: "Web",
    link: "https://github.com/vyshnav-u/number-guess",
    img: "/projects/RETRO/RETRO Hero.png",
    gallery: [
      "/projects/RETRO/RETRO Hero.png",
      "/projects/RETRO/RETRO About.png",
    ],
  },
  {
    id: 4,
    name: "Product Page",
    category: "App",
    link: "https://github.com/vyshnav-u/stacks-library",
    img: "/projects/PRODUCT PAGE/PRODUCT Home.png",
    gallery: [
      "/projects/PRODUCT PAGE/PRODUCT Home.png",
      "/projects/PRODUCT PAGE/PRODUCT Product.png",
      "/projects/PRODUCT PAGE/PRODUCT Order.png",
    ],
  },
  {
    id: 5,
    name: "Flow Landing Page",
    category: "Branding",
    link: "",
    img: "/projects/FLOW/FLOW Home.png",
    gallery: [
      "/projects/FLOW/FLOW Home.png",
      "/projects/FLOW/FLOW Overview.png",
    ],
  },
  {
    id: 6,
    name: "Movie Page",
    category: "App",
    link: "https://github.com/vyshnav-u/movie-app",
    img: "/projects/MOVIE/MOVIE App.png",
    gallery: [
      "/projects/MOVIE/MOVIE App.png",
      "/projects/MOVIE/MOVIE About.png",
    ],
  },
];

const categories = ["See All", ...new Set(projects.map((p) => p.category))];

const pad = (n, len = 3) => String(n).padStart(len, "0");
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

function Work() {
  const pinRef = useRef(null); // tall wrapper that gives the section its "stay"
  const listRef = useRef(null);
  const rowRefs = useRef({});

  const [filter, setFilter] = useState("See All");
  const [hovered, setHovered] = useState(null); // set by the mouse
  const [autoIndex, setAutoIndex] = useState(null); // set by scrolling while pinned
  const [open, setOpen] = useState(false);
  const [y, setY] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const visible =
    filter === "See All"
      ? projects
      : projects.filter((p) => p.category === filter);

  const autoId =
    autoIndex !== null && visible[autoIndex] ? visible[autoIndex].id : null;
  const activeId = hovered ?? autoId; // mouse wins, otherwise the scroll picks
  const current = projects.find((p) => p.id === activeId);
  const shownIndex = visible.findIndex((p) => p.id === activeId);

  // Scroll progress while the section is pinned -> which project is highlighted
  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;

    const onScroll = () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        setAutoIndex(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-rect.top / total, 0, 1);
      const n = visible.length;
      // before the section is pinned nothing is highlighted
      const idx = rect.top > 0 ? null : clamp(Math.floor(p * n), 0, n - 1);
      setAutoIndex((prev) => (prev === idx ? prev : idx));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [visible.length]);

  // When the scroll (not the mouse) picks a row, slide the preview to that row
  useEffect(() => {
    if (hovered !== null || autoId === null) return;
    const row = rowRefs.current[autoId];
    const list = listRef.current;
    if (!row || !list) return;
    const r = row.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    setY(r.top - l.top + r.height / 2);
  }, [autoId, hovered, filter]);

  const handleMove = (e) => {
    if (open || !listRef.current || hovered === null) return;
    const rect = listRef.current.getBoundingClientRect();
    setY(e.clientY - rect.top);
  };

  const handleListLeave = () => {
    setHovered(null); // falls back to the row the scroll picked
    setOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&display=swap');

        .work-font {
          font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
        }

        .work-pin { height: auto; }
        @media (min-width: 768px) {
          .work-pin { height: calc(100vh + var(--n, 6) * ${STAY_VH}vh); }
        }

        @keyframes rowIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes numIn {
          from { opacity: 0; transform: translateY(40%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes galIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .row-in { animation: rowIn 0.5s ease-out both; }
        .num-in { animation: numIn 0.6s ease-out both; }
        .gal-in { animation: galIn 0.5s ease-out both; }
        .dot { animation: dot 1.6s ease-in-out infinite; }
      `}</style>

      {/* Tall wrapper: gives the section scroll distance, so it stays on screen */}
      <div
        ref={pinRef}
        className="work-pin work-font relative"
        style={{ "--n": visible.length, backgroundColor: BG, color: ACCENT }}
      >
        <section
          id="work"
          className="px-4 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-hidden md:px-8"
          style={{ backgroundColor: BG, color: ACCENT }}
        >
          {/* TOP INFO BAR */}
          <div
            className="flex flex-col gap-1 border-b py-4 text-[11px] font-semibold uppercase tracking-tight md:flex-row md:items-center md:justify-between md:text-xs"
            style={{ borderColor: `${ACCENT}26` }}
          >
            <span>Selected Work ({pad(projects.length, 2)})</span>

            <span className="flex items-center gap-2">
              <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-[#140605]" />
              {shownIndex >= 0 && (
                <span className="hidden md:inline">
                  {pad(shownIndex + 1, 2)} / {pad(visible.length, 2)} ·
                </span>
              )}
              Scroll to browse · click to visit on GitHub ↗
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:min-h-0 md:flex-1 md:grid-cols-[200px_1fr] md:grid-rows-1 md:gap-10">
            {/* LEFT: FILTERS + TOTAL */}
            <aside className="flex flex-col justify-between pt-8 md:h-full md:pb-6">
              <ul className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs font-semibold md:flex-col md:gap-y-1">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setFilter(cat);
                        setHovered(null);
                      }}
                      className={`transition-opacity duration-300 ${
                        filter === cat
                          ? "opacity-100"
                          : "opacity-30 hover:opacity-70"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-hidden md:block">
                <p className="mb-2 text-[11px] font-semibold">Total Work</p>

                <div
                  key={visible.length}
                  className="num-in font-bold leading-[0.8] tracking-[-0.06em]"
                  style={{ fontSize: "min(140px, 16vh)" }}
                >
                  {visible.length}
                </div>
              </div>
            </aside>

            {/* RIGHT: PROJECT LIST */}
            <div
              ref={listRef}
              className="relative pt-8 pb-16 md:pb-8"
              onMouseMove={handleMove}
              onMouseLeave={handleListLeave}
            >
              {/* FLOATING IMAGE PREVIEW */}
              <div
                className="absolute right-[8%] top-0 z-30 hidden md:block"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                style={{
                  width: open ? 560 : 260,
                  height: open ? 430 : 325,
                  transform: `translateY(${y}px) translateY(-50%)`,
                  transition:
                    "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), width 0.5s cubic-bezier(0.22, 1, 0.36, 1), height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s",
                  opacity: activeId === null ? 0 : 1,
                  pointerEvents: activeId === null ? "none" : "auto",
                }}
              >
                <div className="relative h-full w-full overflow-hidden bg-[#e9e4d8] shadow-2xl">
                  {/* CLOSED STATE: PROJECT PREVIEW */}
                  <a
                    href={current?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      open ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                  >
                    {projects.map((p) => (
                      <img
                        key={p.id}
                        src={p.img}
                        alt={p.name}
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out ${
                          activeId === p.id
                            ? "scale-100 opacity-100"
                            : "scale-110 opacity-0"
                        }`}
                      />
                    ))}

                    <span className="absolute bottom-2 left-2 bg-[#140605] px-2 py-1 text-[10px] font-semibold uppercase tracking-tight text-[#f8f5ef]">
                      Hover to open collection
                    </span>
                  </a>

                  {/* OPEN STATE: PROJECT GALLERY */}
                  {open && current && (
                    <div className="absolute inset-0 flex flex-col gap-3 bg-[#f8f5ef] p-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-tight">
                        <span>
                          No.{pad(current.id)} · {current.name}
                        </span>

                        <a
                          href={current.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          GitHub ↗
                        </a>
                      </div>

                      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
                        {current.gallery.map((src, i) => (
                          <button
                            key={`${current.id}-${i}`}
                            onClick={() => setSelectedImage(src)}
                            className="gal-in h-full w-full cursor-zoom-in overflow-hidden"
                            style={{ animationDelay: `${i * 80}ms` }}
                          >
                            <img
                              src={src}
                              alt={`${current.name} ${i + 1}`}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PROJECT ROWS */}
              <div key={filter} className="relative z-10">
                {visible.map((p, i) => {
                  const isActive = activeId === p.id;

                  return (
                    <a
                      key={p.id}
                      ref={(el) => {
                        rowRefs.current[p.id] = el;
                      }}
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setHovered(p.id)}
                      className={`row-in grid grid-cols-[70px_1fr_20px] items-center border-b px-2 py-3 text-xs font-semibold transition-colors duration-300 md:grid-cols-[1fr_1fr_20px] md:text-[13px] ${
                        isActive ? "bg-[#140605] text-[#f8f5ef]" : ""
                      }`}
                      style={{
                        borderColor: `${ACCENT}26`,
                        animationDelay: `${i * 40}ms`,
                      }}
                    >
                      <span>No.{pad(p.id)}</span>
                      <span>{p.name}</span>

                      <span
                        className={`text-right transition-transform duration-300 ${
                          isActive ? "-translate-y-0.5 translate-x-0.5" : ""
                        }`}
                      >
                        ↗
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FULLSCREEN IMAGE VIEWER */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#140605]/95 p-4 md:p-10"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-6 top-5 z-10 text-4xl font-light text-[#f8f5ef] transition-opacity hover:opacity-50"
            aria-label="Close image preview"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Full screen project preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default Work;