import React, { useEffect, useRef, useState } from "react";

// details can be plain text, or { label, href } for a clickable link
const items = [
    {
        title: "EXPERIENCE",
        details: [
            "MERN Stack Developer Intern",
            "Luminar Technolab",
            "2026 – Present",
        ],
    },
    {
        title: "EDUCATION",
        details: [
            "Bachelor of Computer Applications",
            "Mahatma Gandhi University",
            "Presentation College of Applied Science",
        ],
    },
    {
        title: "TECHNOLOGIES",
        details: [
            "HTML · CSS · JavaScript",
            "React · Tailwind CSS · Bootstrap",
            "Node.js · Express.js · MongoDB",
            "Git · GitHub",
        ],
    },
    {
        title: "INTERESTS",
        details: ["Web Development", "UI / UX Design", "Creative Coding"],
    },
    {
        title: "CONNECT",
        details: [
            { label: "GitHub", href: "https://github.com/vyshnav-u" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/vyshnavu-vinay-8b3118424/" },
            { label: "Download CV ↓", href: "/vyshnavu fullstack.pdf", download: true },
            { label: "vyshnavuvinay@gmail.com", href: "mailto:vyshnavuvinay@gmail.com" },
        ],
    },
];

// Content for the introduction block at the bottom (edit freely)
const intro = {
    label: "Introduction",
    statement:
        "Hey, I'm Vyshnav. I'm drawn to exploring new ideas, questioning the familiar, and looking beyond the obvious. I believe creativity is what makes us human — the ability to imagine, explore, and bring something new into existence. It's what drives me to keep learning and growing.",
    blocks: [
        {
            heading: "Focus",
            text: "Currently focused on growing as a developer, exploring thoughtful design, and building digital experiences that bring ideas to life. Always learning, experimenting, and pushing myself to create better things.I design and develop full-stack web applications, with a strong eye for layout, typography and smooth interaction.",
        },
        {
            heading: "Approach",
            text: "I approach every challenge with curiosity and an open mind. I believe in understanding before creating, experimenting before settling, and paying attention to the little details that make a difference. For me, the process matters just as much as the outcome.I keep things simple: understand the problem, build with modern tools, and polish every detail until it feels right.",
        },
    ],
};

const STEP_VH = 60; // scroll length per step (desktop only)
const BG = "#f8f5ef";
const ACCENT = "#140605";

// Everything animated below is desktop-only (md = 768px and up).
// On phones the rows are a plain static list with all details visible.
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

function About() {
    const sectionRef = useRef(null);
    const introRef = useRef(null);
    const [active, setActive] = useState(0);
    const [introVisible, setIntroVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            // no scroll-driven animation on small screens
            if (isMobile()) return;
            const el = sectionRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            const p = Math.min(Math.max(-rect.top / total, 0), 0.9999);
            setActive(Math.floor(p * items.length));
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    // Fade the introduction block in when it scrolls into view
    useEffect(() => {
        const el = introRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntroVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const goTo = (index) => {
        if (isMobile()) return; // rows are static on phones, nothing to jump to
        const el = sectionRef.current;
        if (!el) return;
        const sectionTop = el.getBoundingClientRect().top + window.scrollY;
        const total = el.offsetHeight - window.innerHeight;
        window.scrollTo({
            top: sectionTop + ((index + 0.5) / items.length) * total,
            behavior: "smooth",
        });
    };

    const reveal = (delay = 0) => ({
        transitionDelay: introVisible ? `${delay}ms` : "0ms",
    });
    // on phones the intro is always visible; the fade/slide-in is md and up only
    const revealClass = introVisible
        ? "translate-y-0 opacity-100"
        : "md:translate-y-8 md:opacity-0";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&display=swap');
        .about-font {
          font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
        }
        .about-title {
          font-weight: 700;
          letter-spacing: -0.055em;
          line-height: 0.85;
        }
        /* phones: normal flowing section. md and up: tall section that pins while you scroll */
        .about-pin { height: auto; }
        @media (min-width: 768px) {
          .about-pin { height: ${items.length * STEP_VH + 100}vh; }
        }
      `}</style>

            <div
                className="about-font"
                style={{ backgroundColor: BG, color: ACCENT }}
            >
                {/* ---------- Scroll rows (pinned + animated on desktop, static on phones) ---------- */}
                <section id="about" ref={sectionRef} className="about-pin relative">
                    <div className="flex flex-col justify-center py-5 md:sticky md:top-0 md:pt-10">
                        {items.map((item, i) => {
                            const isActive = i === active;
                            return (
                                <div
                                    key={item.title}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => goTo(i)}
                                    onKeyDown={(e) => e.key === "Enter" && goTo(i)}
                                    className={`flex w-full flex-col gap-2 border-b px-4 pb-3 pt-4 text-left first:border-t md:cursor-pointer md:flex-row md:items-end md:justify-between md:gap-8 md:px-8 md:pb-4 md:pt-5 md:transition-all md:duration-500 md:ease-out ${
                                        isActive
                                            ? "opacity-100"
                                            : "opacity-100 md:opacity-40 md:hover:opacity-70"
                                    }`}
                                    style={{ borderColor: ACCENT }}
                                >
                                    {/* Big title */}
                                    <span
                                        className={`about-title whitespace-nowrap text-[8vw] md:text-[min(6.2vw,14vh)] md:transition-transform md:duration-500 md:ease-out ${
                                            isActive ? "md:translate-x-4" : "md:translate-x-0"
                                        }`}
                                    >
                                        ({i + 1}) {item.title}
                                    </span>

                                    {/* Small details */}
                                    <span className="flex flex-col md:items-end md:text-right">
                                        {item.details.map((line, j) => {
                                            const isLink = typeof line === "object";
                                            const label = isLink ? line.label : line;

                                            const classes = `text-[10px] font-bold uppercase leading-[1.2] tracking-tight md:text-[12px] md:transition-all md:duration-500 md:ease-out ${
                                                isActive
                                                    ? "md:translate-x-0 md:opacity-100"
                                                    : "md:translate-x-3 md:opacity-60"
                                            }`;
                                            const delay = {
                                                transitionDelay: isActive ? `${j * 80}ms` : "0ms",
                                            };

                                            return isLink ? (
                                                <a
                                                    key={label}
                                                    href={line.href}
                                                    target={
                                                        line.href.startsWith("http") ? "_blank" : undefined
                                                    }
                                                    rel="noopener noreferrer"
                                                    download={line.download ? true : undefined}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`${classes} py-0.5 underline-offset-2 hover:underline`}
                                                    style={delay}
                                                >
                                                    {label}
                                                </a>
                                            ) : (
                                                <span key={label} className={classes} style={delay}>
                                                    {label}
                                                </span>
                                            );
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ---------- Introduction block ---------- */}
                <section
                    ref={introRef}
                    className="grid grid-cols-1 items-center gap-16 px-4 py-10 md:min-h-screen md:grid-cols-[1.25fr_1fr] md:gap-24 md:px-8 md:py-32"
                >
                    {/* Left: big statement */}
                    <p
                        className={`max-w-[18em] text-[7vw] font-medium leading-[1.15] tracking-[-0.02em] md:text-[2.9vw] md:transition-all md:duration-1000 md:ease-out ${revealClass}`}
                        style={reveal(0)}
                    >
                        {intro.statement}
                    </p>

                    {/* Right: label + blocks */}
                    <div className="flex flex-col gap-14 md:gap-20">
                        {/* Label with simple brackets */}
                        <div
                            className={`flex justify-center md:justify-start md:pl-6 md:transition-all md:duration-1000 md:ease-out ${revealClass}`}
                            style={reveal(150)}
                        >
                            <span className="text-sm font-semibold tracking-tight md:text-base">
                                ( {intro.label} )
                            </span>
                        </div>

                        {/* Text blocks */}
                        <div className="flex max-w-sm flex-col gap-10 md:gap-12">
                            {intro.blocks.map((block, i) => (
                                <div
                                    key={block.heading}
                                    className={`md:transition-all md:duration-1000 md:ease-out ${revealClass}`}
                                    style={reveal(300 + i * 150)}
                                >
                                    <h4 className="mb-3 text-[12px] font-bold tracking-tight">
                                        {block.heading}
                                    </h4>
                                    <p className="text-[12px] leading-[1.6] opacity-80">
                                        {block.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default About;