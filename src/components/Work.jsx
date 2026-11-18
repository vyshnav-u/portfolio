import React, { useRef, useState } from "react";

const BG = "#f8f5ef";
const ACCENT = "#140605";

// Dummy image pool. Replace with your real project images.
const pool = [
  "https://i.pinimg.com/1200x/c6/2f/ca/c62fca3fc71e6f542066fc414c10d44b.jpg",
  "https://i.pinimg.com/1200x/39/dc/0b/39dc0bf4a94ba7163c7fc9c72e24dddc.jpg",
  "https://i.pinimg.com/1200x/9c/90/df/9c90df5147aaa11fd14db0503927fcb4.jpg",
  "https://i.pinimg.com/736x/66/f5/cf/66f5cf8db0e6e5c9507b07f824f0a3da.jpg",
  "https://i.pinimg.com/736x/1a/1d/11/1a1d110ce75c5173361396ab8f233a6b.jpg",
  "https://i.pinimg.com/1200x/a9/d8/22/a9d8221d495073cb899d8c9646c9b005.jpg",
];

// `img` is the preview, `gallery` is the collection shown on image hover.
// `link` is the GitHub repo that opens on click.
const rawProjects = [
  { id: 1, name: "Zenith Studio Branding", category: "Branding", link: "https://github.com/your-username/zenith-studio" },
  { id: 2, name: "Elysian Landing Page", category: "Web", link: "https://github.com/your-username/elysian-landing" },
  { id: 3, name: "Solstice Poster Series", category: "Poster", link: "https://github.com/your-username/solstice-posters" },
  { id: 4, name: "Nova Mobile App", category: "App", link: "https://github.com/your-username/nova-app" },
  { id: 5, name: "Quantum Social Kit", category: "Branding", link: "https://github.com/your-username/quantum-social" },
  { id: 6, name: "Celestial Portfolio", category: "Web", link: "https://github.com/your-username/celestial-portfolio" },
  { id: 7, name: "Stellar Event Poster", category: "Poster", link: "https://github.com/your-username/stellar-poster" },
  { id: 8, name: "Fusion Food Delivery", category: "App", link: "https://github.com/your-username/fusion-food" },
  { id: 9, name: "Mirage Café Identity", category: "Branding", link: "https://github.com/your-username/mirage-cafe" },
  { id: 10, name: "Harmonia Music Site", category: "Web", link: "https://github.com/your-username/harmonia-music" },
];

const projects = rawProjects.map((p, i) => {
  const gallery = [0, 1, 2, 3].map((n) => pool[(i + n) % pool.length]);
  return { ...p, img: gallery[0], gallery };
});

const categories = ["See All", ...new Set(projects.map((p) => p.category))];
const pad = (n, len = 3) => String(n).padStart(len, "0");

function Work() {
  const listRef = useRef(null);
  const [filter, setFilter] = useState("See All");
  const [hovered, setHovered] = useState(null); // project id
  const [open, setOpen] = useState(false); // gallery open (mouse on the image)
  const [y, setY] = useState(0); // cursor Y inside the list

  const visible =
    filter === "See All"
      ? projects
      : projects.filter((p) => p.category === filter);

  const current = projects.find((p) => p.id === hovered);

  const handleMove = (e) => {
    if (open) return; // freeze the image while the gallery is open
    const rect = listRef.current.getBoundingClientRect();
    setY(e.clientY - rect.top);
  };

  const handleListLeave = () => {
    setHovered(null);
    setOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&display=swap');
        .work-font { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes numIn {
          from { opacity: 0; transform: translateY(40%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes galIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes dot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }
        .row-in { animation: rowIn 0.5s ease-out both; }
        .num-in { animation: numIn 0.6s ease-out both; }
        .gal-in { animation: galIn 0.5s ease-out both; }
        .dot { animation: dot 1.6s ease-in-out infinite; }
      `}</style>

      <section
        id="work"
        className="work-font min-h-screen px-4 md:px-8"
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
            Click any project to visit it on GitHub ↗
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:gap-10">

          {/* LEFT: filters + total.
              Height = screen minus the top bar, so the total number always
              sits fully inside the screen (it was cut off before). */}
          <aside className="flex flex-col justify-between pt-8 md:sticky md:top-4 md:h-[calc(100dvh-5rem)] md:self-start md:pb-4">
            <ul className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs font-semibold md:flex-col md:gap-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setFilter(cat)}
                    className={`transition-opacity duration-300 ${
                      filter === cat ? "opacity-100" : "opacity-30 hover:opacity-70"
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

          {/* RIGHT: project list */}
          <div
            ref={listRef}
            className="relative pt-8 pb-16 md:pb-8"
            onMouseMove={handleMove}
            onMouseLeave={handleListLeave}
          >
            {/* Floating preview. Hover it and it expands into the gallery. */}
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
                opacity: hovered === null ? 0 : 1,
                pointerEvents: hovered === null ? "none" : "auto",
              }}
            >
              <div className="relative h-full w-full overflow-hidden bg-[#e9e4d8] shadow-2xl">

                {/* Closed state: single preview (click opens GitHub) */}
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
                        hovered === p.id ? "scale-100 opacity-100" : "scale-110 opacity-0"
                      }`}
                    />
                  ))}
                  <span className="absolute bottom-2 left-2 bg-[#140605] px-2 py-1 text-[10px] font-semibold uppercase tracking-tight text-[#f8f5ef]">
                    Hover to open collection
                  </span>
                </a>

                {/* Open state: gallery of the hovered project */}
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
                        <img
                          key={`${current.id}-${i}`}
                          src={src}
                          alt={`${current.name} ${i + 1}`}
                          className="gal-in h-full w-full object-cover"
                          style={{ animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rows (key restarts the stagger animation when the filter changes) */}
            <div key={filter} className="relative z-10">
              {visible.map((p, i) => {
                const isHovered = hovered === p.id;
                return (
                  <a
                    key={p.id}
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHovered(p.id)}
                    className={`row-in grid grid-cols-[70px_1fr_20px] items-center border-b px-2 py-3 text-xs font-semibold transition-colors duration-300 md:grid-cols-[1fr_1fr_20px] md:text-[13px] ${
                      isHovered ? "bg-[#140605] text-[#f8f5ef]" : ""
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
                        isHovered ? "-translate-y-0.5 translate-x-0.5" : ""
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
    </>
  );
}

export default Work;