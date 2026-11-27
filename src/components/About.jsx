import React, { useEffect, useRef, useState } from "react";
// npm i react-icons
import {
    FiBriefcase,
    FiBookOpen,
    FiLayers,
    FiHeart,
    FiSend,
    FiDownload,
    FiMail,
    FiMonitor,
    FiPenTool,
    FiZap,
    FiServer,
    FiAward,
} from "react-icons/fi";
import {
    FaGithub,
    FaLinkedinIn,
    FaHtml5,
    FaCss3Alt,
    FaJs,
    FaReact,
    FaBootstrap,
    FaNodeJs,
    FaGitAlt,
    FaFigma,
} from "react-icons/fa";
import { SiTailwindcss, SiExpress, SiMongodb } from "react-icons/si";

// details  -> small lines on the right of each row (text, or { label, href, icon })
// about    -> short paragraph shown when the row is active
// tags     -> chips with icons shown when the row is active (edit freely)
const items = [
    {
        title: "EXPERIENCE",
        icon: FiBriefcase,
        details: [
            "MERN Stack Developer Intern",
            "Luminar Technolab",
            "2026 – Present",
        ],
        about:
            "Building full-stack web applications with the MERN stack: responsive React interfaces, REST APIs with Express, and data modelling in MongoDB, using Git-based workflows day to day.",
        tags: [
            { label: "React", icon: FaReact },
            { label: "Node.js", icon: FaNodeJs },
            { label: "Express", icon: SiExpress },
            { label: "MongoDB", icon: SiMongodb },
        ],
    },
    {
        title: "EDUCATION",
        icon: FiBookOpen,
        details: [
            "Bachelor of Computer Applications",
            "Mahatma Gandhi University",
            "Presentation College of Applied Science",
        ],
        about:
            "Studying computer applications with a focus on programming, databases and web technologies, and putting the theory to work in real projects alongside the internship.",
        tags: [
            { label: "BCA", icon: FiAward },
            { label: "Web technologies", icon: FiMonitor },
            { label: "Databases", icon: FiServer },
        ],
    },
    {
        title: "TECHNOLOGIES",
        icon: FiLayers,
        details: [
            "HTML · CSS · JavaScript",
            "React · Tailwind CSS · Bootstrap",
            "Node.js · Express.js · MongoDB",
            "Git · GitHub",
        ],
        about:
            "A full-stack toolkit: semantic markup and modern CSS on the front, component-driven React and Tailwind for UI, Node and Express for the API layer, and MongoDB for storage.",
        tags: [
            { label: "HTML", icon: FaHtml5 },
            { label: "CSS", icon: FaCss3Alt },
            { label: "JavaScript", icon: FaJs },
            { label: "React", icon: FaReact },
            { label: "Tailwind", icon: SiTailwindcss },
            { label: "Bootstrap", icon: FaBootstrap },
            { label: "Node.js", icon: FaNodeJs },
            { label: "Express", icon: SiExpress },
            { label: "MongoDB", icon: SiMongodb },
            { label: "Git", icon: FaGitAlt },
            { label: "GitHub", icon: FaGithub },
            { label: "Figma", icon: FaFigma },
        ],
    },
    {
        title: "INTERESTS",
        icon: FiHeart,
        details: ["Web Development", "UI / UX Design", "Creative Coding"],
        about:
            "I like the point where design and code meet: interfaces that feel considered, motion that explains what changed, and small experiments that turn an idea into something people can use.",
        tags: [
            { label: "Web development", icon: FiMonitor },
            { label: "UI / UX design", icon: FaFigma },
            { label: "Creative coding", icon: FiZap },
            { label: "Interaction design", icon: FiPenTool },
        ],
    },
    {
        title: "CONNECT",
        icon: FiSend,
        details: ["Open to work and collaboration", "Say hello below"],
        about:
            "Looking for opportunities to build and learn. Reach out about internships, projects or just to talk about web development.",
        tags: [
            { label: "GitHub", href: "https://github.com/vyshnav-u", icon: FaGithub },
            {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/vyshnavu-vinay-8b3118424/",
                icon: FaLinkedinIn,
            },
            {
                label: "Download CV",
                href: "/vyshnavu fullstack.pdf",
                download: true,
                icon: FiDownload,
            },
            {
                label: "vyshnavuvinay@gmail.com",
                href: "mailto:vyshnavuvinay@gmail.com",
                icon: FiMail,
            },
        ],
    },
];

// Content for the introduction block at the bottom
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

const STEP_VH = 115; // vertical scroll needed to move one screen sideways (desktop only)
const INTRO_VH = 560; // scroll spent on the opening statement before the first screen (desktop only)

// --- Opening statement timing (desktop only) ---
const PRE_VH = 100; // reveal starts this much scroll BEFORE the section is pinned. 100 = on the very first scroll after a one-screen hero
const PRE_RISE_VH = 40; // the text starts this far higher so it floats into view right away (0 = off)
const LIFT_VH = 85; // scroll spent lifting the statement away to uncover the first screen
const REVEAL_END = 0.9; // words finish at this share of the reveal range; the rest is a short reading pause

// The background colour now comes from <ScribbleBackground>, which wraps Hero and About,
// so this component is transparent and the red lines show through.
const ACCENT = "#140605";
// Same beige as ScribbleBackground. The main section (and the bottom introduction)
// paint it solid, so the red lines show only through the hero and the opening statement.
const BG = "#f8f5ef";

// Smooth wheel scrolling for the whole page while this component is mounted (desktop mouse / trackpad only)
const SMOOTH_WHEEL = true;
const SMOOTH_WHEEL_EASE = 0.05; // lower = floatier (more lag), higher = snappier
const WHEEL_ACCEL = 0.1; // extra speed at full pressure (0 = off, 0.6 = up to 1.6x). Small on purpose
const WHEEL_ACCEL_REF = 3; // wheel speed (px per ms) that counts as "full pressure"
const WHEEL_LINE_PX = 33; // pixels per "line" for browsers that report wheel lines (Firefox)

// Opening statement: words go from faint to solid as you scroll (edit freely)
const STATEMENT =
    "I build full-stack web apps with the MERN stack, and I care about the small details that make an interface feel right. Right now I'm interning at Luminar Technolab, learning fast and shipping real projects.";
const STATEMENT_WORDS = STATEMENT.split(" ");

// Everything animated below is desktop-only (md = 768px and up).
// On phones the rows are a plain static list with all content visible.
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// Each screen "holds" still for part of its scroll range, then slides to the next one.
const LAST = items.length - 1;
const HOLD = 0.3; // share of every step spent standing still at each end
const ease = (t) => t * t * (3 - 2 * t);
const settle = (r) => {
    if (r >= LAST) return LAST;
    const k = Math.floor(r);
    const u = clamp((r - k - HOLD) / (1 - 2 * HOLD), 0, 1);
    return k + ease(u);
};

// One entrance animation per title (desktop only)
const TITLE_ANIMS = ["rise", "slide", "drop", "flip", "wipe"];

function AnimatedTitle({ text, variant, on }) {
    if (variant === "slide") {
        // whole title glides in from the right and fades up (no blur)
        return (
            <span
                className="block"
                style={{
                    transform: on ? "translateX(0)" : "translateX(14vw)",
                    opacity: on ? 1 : 0,
                    transition:
                        "transform 1100ms cubic-bezier(.22,1,.36,1), opacity 800ms ease-out",
                }}
            >
                {text}
            </span>
        );
    }
    if (variant === "wipe") {
        // revealed left to right like a curtain
        return (
            <span
                className="block"
                style={{
                    clipPath: on ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                    transition: "clip-path 1100ms cubic-bezier(.7,0,.2,1)",
                }}
            >
                {text}
            </span>
        );
    }

    // letter-by-letter variants: rise / drop / flip
    const hidden = {
        rise: { transform: "translateY(110%)", opacity: 1 },
        drop: { transform: "translateY(-120%) rotate(-18deg)", opacity: 0 },
        flip: { transform: "rotateX(90deg)", opacity: 0 },
    }[variant];
    const shown = { transform: "none", opacity: 1 };

    return (
        <span
            className={`block ${variant === "flip" ? "" : "overflow-hidden"}`}
            style={{ perspective: "800px" }}
        >
            {[...text].map((ch, k) => (
                <span
                    key={k}
                    className="inline-block"
                    style={{
                        ...(on ? shown : hidden),
                        transformOrigin: "50% 100%",
                        transition: `transform 800ms cubic-bezier(.2,.8,.2,1) ${
                            on ? k * 45 : 0
                        }ms, opacity 500ms ease-out ${on ? k * 45 : 0}ms`,
                    }}
                >
                    {ch === " " ? "\u00A0" : ch}
                </span>
            ))}
        </span>
    );
}

function About() {
    const sectionRef = useRef(null);
    const introRef = useRef(null);
    const wordRefs = useRef([]); // the words of the opening statement, driven directly from JS
    const applyRef = useRef(null); // recompute everything from the current scroll position
    const scrollerRef = useRef(null); // smooth-scroll engine: { to(y) } (null when not active)
    const [active, setActive] = useState(0); // which screen is centered
    const [entered, setEntered] = useState(false); // opening transition has revealed the first screen
    const [introVisible, setIntroVisible] = useState(false);
    const [desktop, setDesktop] = useState(false);

    const last = items.length - 1;

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const sync = () => setDesktop(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    // ---------- Scroll position -> everything on screen (single layer, no extra easing) ----------
    useEffect(() => {
        const root = sectionRef.current;
        if (!root) return;

        let idle = 0;
        let lastY = -1;
        let lastVh = -1;
        let shownActive = 0;
        let shownEntered = false;

        const apply = (force = false) => {
            if (isMobile()) return; // no scroll-driven animation on small screens
            const y = window.scrollY;
            const vh = window.innerHeight;
            if (!force && y === lastY && vh === lastVh) return; // nothing moved
            lastY = y;
            lastVh = vh;

            const rect = root.getBoundingClientRect();
            const total = rect.height - vh;
            const introPx = (INTRO_VH / 100) * vh;
            const prePx = (PRE_VH / 100) * vh;
            const liftPx = (LIFT_VH / 100) * vh;
            const scrolled = clamp(-rect.top, 0, total);
            const ext = -rect.top + prePx; // starts counting while the section is still entering

            const pre = prePx > 0 ? clamp(ext / prePx, 0, 1) : 1; // 0 → 1 while the section arrives
            const reveal = clamp(ext / (introPx - liftPx + prePx) / REVEAL_END, 0, 1); // words 0 → 1
            const lift = ease(clamp((-rect.top - (introPx - liftPx)) / liftPx, 0, 1)); // statement lifts away
            const p = clamp((scrolled - introPx) / (total - introPx), 0, 1); // sideways screens 0 → 1
            const pos = settle(p * LAST);

            root.style.setProperty("--pos", pos.toFixed(4));
            root.style.setProperty("--lift", lift.toFixed(4));
            root.style.setProperty("--reveal", reveal.toFixed(4));
            root.style.setProperty("--drop", ((1 - pre) * PRE_RISE_VH).toFixed(3));

            // words fade and rise in one after another
            const words = wordRefs.current;
            const n = STATEMENT_WORDS.length;
            const w = 3 / n; // each word takes about 3 words' worth of progress
            for (let k = 0; k < n; k++) {
                const el = words[k];
                if (!el) continue;
                const s = (k / n) * (1 - w);
                const q = clamp((reveal - s) / w, 0, 1);
                const e = 1 - Math.pow(1 - q, 3); // ease-out
                el.style.opacity = e.toFixed(3);
                el.style.transform = `translate3d(0, ${((1 - e) * 0.5).toFixed(3)}em, 0)`;
            }

            // only touch React state when the value really changes
            const a = Math.round(pos);
            if (a !== shownActive) {
                shownActive = a;
                setActive(a);
            }
            const en = lift > 0.6;
            if (en !== shownEntered) {
                shownEntered = en;
                setEntered(en);
            }
        };
        applyRef.current = apply;

        // when scrolling stops between two sideways screens, settle on the nearest one
        const snap = () => {
            if (isMobile()) return;
            const vh = window.innerHeight;
            const rect = root.getBoundingClientRect();
            const total = rect.height - vh;
            const introPx = (INTRO_VH / 100) * vh;
            const scrolled = -rect.top;
            if (scrolled <= introPx || scrolled >= total) return; // the statement never snaps

            const t = settle(clamp((scrolled - introPx) / (total - introPx), 0, 1) * LAST);
            const nearest = Math.round(t);
            if (Math.abs(t - nearest) < 0.02) return;
            const y = rect.top + window.scrollY + introPx + (nearest / LAST) * (total - introPx);
            if (scrollerRef.current) scrollerRef.current.to(y);
            else window.scrollTo({ top: y, behavior: "smooth" });
        };

        const onScroll = () => {
            apply();
            clearTimeout(idle);
            idle = setTimeout(snap, 220);
        };
        const onResize = () => apply(true);

        apply(true);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        return () => {
            clearTimeout(idle);
            applyRef.current = null;
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    // The opening words only exist once `desktop` is true, so draw them in their current state then
    useEffect(() => {
        if (applyRef.current) applyRef.current(true);
    }, [desktop]);

    // ---------- Smooth, inertial wheel scrolling for the whole page ----------
    // One engine does all programmatic scrolling (wheel, snap, nav clicks) so nothing fights.
    useEffect(() => {
        if (!SMOOTH_WHEEL) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) return;

        let cur = window.scrollY; // where the page is drawn
        let target = cur; // where the wheel wants it
        let raf = 0;
        let last = 0;
        let programmatic = false; // current motion was started by snap / nav click
        let wSpeed = 0; // smoothed wheel intensity, px per ms
        let lastWheelT = 0;

        const maxScroll = () =>
            Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        const clampY = (y) => clamp(y, 0, maxScroll());

        const loop = (t) => {
            const dt = Math.min(t - last, 50); // frame-rate independent
            last = t;
            cur += (target - cur) * (1 - Math.pow(1 - SMOOTH_WHEEL_EASE, dt / 16.67));
            if (Math.abs(target - cur) < 0.3) cur = target;
            window.scrollTo({ top: cur, behavior: "instant" });
            if (applyRef.current) applyRef.current(); // update the section in the same frame
            if (cur !== target) {
                raf = requestAnimationFrame(loop);
            } else {
                raf = 0;
                programmatic = false;
            }
        };

        // let scrollable boxes inside the page (modals, textareas) scroll normally
        const scrollsInside = (node, dy) => {
            while (node && node !== document.body && node !== document.documentElement) {
                if (node.nodeType === 1) {
                    const st = getComputedStyle(node);
                    if (/(auto|scroll)/.test(st.overflowY) && node.scrollHeight > node.clientHeight + 1) {
                        const atTop = node.scrollTop <= 0;
                        const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
                        if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) return true;
                    }
                }
                node = node.parentElement;
            }
            return false;
        };

        const onWheel = (e) => {
            if (e.ctrlKey || e.defaultPrevented || e.deltaY === 0) return; // pinch-zoom / sideways
            if (scrollsInside(e.target, e.deltaY)) return;
            e.preventDefault();

            if (!raf) {
                // stop any native smooth scroll (keyboard, anchor links) still running
                window.scrollTo({ top: window.scrollY, behavior: "instant" });
                cur = target = window.scrollY;
                last = performance.now();
            } else if (programmatic) {
                target = cur; // the wheel interrupts a snap / nav jump cleanly
            }
            programmatic = false;

            const dy =
                e.deltaMode === 1
                    ? e.deltaY * WHEEL_LINE_PX
                    : e.deltaMode === 2
                    ? e.deltaY * window.innerHeight
                    : e.deltaY;

            // pressure: the faster the wheel is spun, the further each notch travels (a small boost)
            const now = performance.now();
            const gap = Math.max(now - lastWheelT, 8);
            lastWheelT = now;
            if (gap > 200) wSpeed = 0; // a pause resets the pressure
            wSpeed = wSpeed * 0.7 + (Math.abs(dy) / gap) * 0.3;
            const boost = 1 + WHEEL_ACCEL * Math.min(wSpeed / WHEEL_ACCEL_REF, 1);

            target = clampY(target + dy * boost);
            if (!raf) raf = requestAnimationFrame(loop);
        };

        // keyboard, scrollbar drags and anchor links scroll on their own: stay in sync with them
        const onScroll = () => {
            const y = window.scrollY;
            if (!raf) {
                cur = target = y;
                return;
            }
            if (Math.abs(y - cur) > 3) {
                // somebody else is scrolling: hand control back
                cancelAnimationFrame(raf);
                raf = 0;
                programmatic = false;
                cur = target = y;
            }
        };

        scrollerRef.current = {
            to: (y) => {
                target = clampY(y);
                programmatic = true;
                if (!raf) {
                    cur = window.scrollY;
                    last = performance.now();
                    raf = requestAnimationFrame(loop);
                }
            },
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            if (raf) cancelAnimationFrame(raf);
            scrollerRef.current = null;
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("scroll", onScroll);
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
        if (isMobile()) return;
        const el = sectionRef.current;
        if (!el) return;
        const vh = window.innerHeight;
        const sectionTop = el.getBoundingClientRect().top + window.scrollY;
        const total = el.offsetHeight - vh;
        const introPx = (INTRO_VH / 100) * vh;
        const y = sectionTop + introPx + (index / last) * (total - introPx);
        if (scrollerRef.current) scrollerRef.current.to(y);
        else window.scrollTo({ top: y, behavior: "smooth" });
    };

    const reveal = (delay = 0) => ({
        transitionDelay: introVisible ? `${delay}ms` : "0ms",
    });
    const revealClass = introVisible
        ? "translate-y-0 opacity-100"
        : "md:translate-y-8 md:opacity-0 md:blur-[5px]";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700;800&display=swap');
        .about-font {
          font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
        }
        .about-title {
          font-weight: 700;
          letter-spacing: -0.055em;
          line-height: 0.85;
        }
        @keyframes about-hint {
          0%, 100% { transform: scaleX(0.3); transform-origin: left; opacity: 0.4; }
          50% { transform: scaleX(1); transform-origin: left; opacity: 1; }
        }
        .about-hint-line { animation: about-hint 1.8s ease-in-out infinite; }
        .about-pin { height: auto; }
        @media (min-width: 768px) {
          .about-pin { height: ${INTRO_VH + last * STEP_VH + 100}vh; }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-font * { transition-duration: 0ms !important; transition-delay: 0ms !important; }
          .about-hint-line { animation: none; }
        }
      `}</style>

            <div
                className="about-font"
                style={{ color: ACCENT }}
            >
                {/* ---------- Horizontal scroll: vertical scrolling pushes the screens sideways ---------- */}
                <section id="about" ref={sectionRef} className="about-pin relative">
                    <div className="relative md:sticky md:top-0 md:h-screen md:overflow-hidden">
                        {/* Opening statement: words appear one by one from the first scroll, then the screen lifts away */}
                        {desktop && (
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
                                style={{
                                    clipPath: "inset(0 0 calc(var(--lift, 0) * 100%) 0)",
                                }}
                            >
                                {/* very soft light in the centre */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 100%)",
                                    }}
                                />
                                {/* minimal scroll hint, top corner; stays for the whole opening section */}
                                <div className="absolute right-[7vw] top-[5vh] flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight">
                                    <span>Scroll</span>
                                    <span
                                        className="about-hint-line block h-px w-8"
                                        style={{ backgroundColor: ACCENT }}
                                    />
                                </div>
                                <p
                                    className="relative max-w-[38vw] text-center text-[min(2.4vw,5vh)] font-light uppercase leading-[1.3] tracking-[-0.005em]"
                                    style={{
                                        // floats up into view during the first scroll, then lifts away at the end
                                        transform:
                                            "translateY(calc(var(--drop, 0) * -1vh + var(--lift, 0) * -14vh))",
                                    }}
                                >
                                    {STATEMENT_WORDS.map((word, k) => {
                                        const n = STATEMENT_WORDS.length;
                                        // quotation marks at both ends of the statement
                                        const text = `${k === 0 ? "\u201C" : ""}${word}${k === n - 1 ? "\u201D" : ""}`;
                                        return (
                                            <React.Fragment key={k}>
                                                <span
                                                    ref={(el) => {
                                                        wordRefs.current[k] = el;
                                                    }}
                                                    className="inline-block"
                                                    style={{
                                                        opacity: 0,
                                                        transform: "translate3d(0, 0.5em, 0)",
                                                        willChange: "opacity, transform",
                                                    }}
                                                >
                                                    {text}
                                                </span>{" "}
                                            </React.Fragment>
                                        );
                                    })}
                                </p>

                                {/* thin progress line, like a reading indicator */}
                                <div
                                    className="absolute bottom-[9vh] left-1/2 h-px w-[9vw] -translate-x-1/2"
                                    style={{ backgroundColor: "rgba(20,6,5,0.2)" }}
                                >
                                    <div
                                        className="h-px"
                                        style={{
                                            backgroundColor: ACCENT,
                                            width: "calc(var(--reveal, 0) * 100%)",
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Wrapper reveals the first screen (clip) while the track inside slides sideways (transform) */}
                        <div
                            className="md:h-full"
                            style={{
                                backgroundColor: BG,
                                ...(desktop
                                    ? { clipPath: "inset(calc((1 - var(--lift, 0)) * 100%) 0 0 0)" }
                                    : {}),
                            }}
                        >
                            {/* The horizontal track */}
                            <div
                                className="flex flex-col md:h-full md:w-max md:flex-row md:will-change-transform"
                                style={
                                    desktop
                                        ? { transform: "translate3d(calc(var(--pos, 0) * -100vw), 0, 0)" }
                                        : undefined
                                }
                            >
                                {items.map((item, i) => {
                                    const isActive = i === active && (i !== 0 || entered);
                                    const on = desktop ? isActive : true;

                                    return (
                                        <article
                                            key={item.title}
                                            aria-hidden={desktop && !isActive ? "true" : undefined}
                                            className="relative flex flex-col justify-between gap-12 px-6 py-14 md:h-full md:w-screen md:shrink-0 md:gap-0 md:px-[7vw] md:pb-[17vh] md:pt-[13vh]"
                                        >
                                            {/* Title: its own entrance animation per section, plus a slight parallax */}
                                            <div
                                                className="relative"
                                                style={
                                                    desktop
                                                        ? { transform: `translateX(calc((var(--pos, 0) - ${i}) * -9vw))` }
                                                        : undefined
                                                }
                                            >
                                                <h2 className="about-title whitespace-nowrap py-1 text-[8vw] md:py-3 md:text-[min(7.6vw,16vh)]">
                                                    {desktop ? (
                                                        <AnimatedTitle
                                                            text={`(${i + 1}) ${item.title}`}
                                                            variant={TITLE_ANIMS[i % TITLE_ANIMS.length]}
                                                            on={on}
                                                        />
                                                    ) : (
                                                        `(${i + 1}) ${item.title}`
                                                    )}
                                                </h2>
                                            </div>

                                            {/* Bottom: text left, chips right, both pinned to the bottom of the screen */}
                                            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-16">
                                                <div className="flex flex-col gap-6 md:gap-8">
                                                    <p
                                                        className={`max-w-[20em] text-[13px] leading-[1.6] opacity-80 md:text-[clamp(16px,2vw,32px)] md:font-medium md:leading-[1.25] md:tracking-[-0.01em] md:opacity-90 md:transition-[transform,opacity] md:duration-[900ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                            isActive
                                                                ? "md:translate-y-0 md:opacity-90"
                                                                : "md:translate-y-8 md:opacity-0"
                                                        }`}
                                                        style={{ transitionDelay: isActive ? "350ms" : "0ms" }}
                                                    >
                                                        {item.about}
                                                    </p>

                                                    <span className="flex flex-col">
                                                        {item.details.map((line, j) => (
                                                            <span
                                                                key={line}
                                                                className={`text-[10px] font-bold uppercase leading-[1.25] tracking-tight md:text-[clamp(12px,1.1vw,18px)] md:transition-[transform,opacity] md:duration-700 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                                    isActive
                                                                        ? "md:translate-y-0 md:opacity-100"
                                                                        : "md:translate-y-6 md:opacity-0"
                                                                }`}
                                                                style={{
                                                                    transitionDelay: isActive
                                                                        ? `${450 + j * 80}ms`
                                                                        : "0ms",
                                                                }}
                                                            >
                                                                {line}
                                                            </span>
                                                        ))}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 md:content-end md:justify-end md:gap-3">
                                                    {item.tags.map((tag, k) => {
                                                        const TagIcon = tag.icon;
                                                        const chipClass = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight md:gap-2 md:px-4 md:py-2 md:text-[14px] md:transition-[transform,opacity] md:duration-700 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                            isActive
                                                                ? "md:translate-y-0 md:opacity-100"
                                                                : "md:translate-y-8 md:opacity-0"
                                                        }`;
                                                        const chipStyle = {
                                                            borderColor: ACCENT,
                                                            transitionDelay: isActive ? `${500 + k * 70}ms` : "0ms",
                                                        };
                                                        const content = (
                                                            <>
                                                                <TagIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                                {tag.label}
                                                            </>
                                                        );

                                                        return tag.href ? (
                                                            <a
                                                                key={tag.label}
                                                                href={tag.href}
                                                                target={tag.href.startsWith("http") ? "_blank" : undefined}
                                                                rel="noopener noreferrer"
                                                                download={tag.download ? true : undefined}
                                                                className={`${chipClass} hover:!bg-[#140605] hover:!text-[#f8f5ef]`}
                                                                style={chipStyle}
                                                            >
                                                                {content}
                                                            </a>
                                                        ) : (
                                                            <span key={tag.label} className={chipClass} style={chipStyle}>
                                                                {content}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Counter + progress (desktop only): the number rolls and the line fills as you scroll */}
                        <div
                            aria-hidden="true"
                            className="absolute right-[7vw] top-[5vh] z-20 hidden items-center gap-3 text-[11px] font-bold tracking-tight md:flex"
                            style={{ opacity: "var(--lift, 0)" }}
                        >
                            <span className="block overflow-hidden" style={{ height: "1.25em", lineHeight: "1.25em" }}>
                                <span
                                    className="block will-change-transform"
                                    style={{ transform: "translateY(calc(var(--pos, 0) * -1.25em))" }}
                                >
                                    {items.map((item, i) => (
                                        <span key={item.title} className="block" style={{ height: "1.25em" }}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                    ))}
                                </span>
                            </span>
                            <span className="relative block h-px w-16" style={{ backgroundColor: "rgba(20,6,5,0.2)" }}>
                                <span
                                    className="absolute left-0 top-0 block h-px"
                                    style={{
                                        backgroundColor: ACCENT,
                                        width: `calc(var(--pos, 0) / ${last} * 100%)`,
                                    }}
                                />
                            </span>
                            <span>{String(items.length).padStart(2, "0")}</span>
                        </div>

                        {/* Section nav (desktop only): jump to a screen; underline follows the scroll */}
                        <nav
                            className="absolute inset-x-0 bottom-0 z-20 hidden items-center justify-between px-[7vw] pb-[5vh] md:flex"
                            style={{ opacity: "var(--lift, 0)" }}
                        >
                            {items.map((item, i) => {
                                return (
                                    <button
                                        key={item.title}
                                        type="button"
                                        onClick={() => goTo(i)}
                                        className={`relative pb-1.5 text-[11px] font-bold uppercase tracking-tight transition-opacity duration-500 ${
                                            i === active ? "opacity-100" : "opacity-40 hover:opacity-70"
                                        }`}
                                    >
                                        ({i + 1}) {item.title}
                                        <span
                                            aria-hidden="true"
                                            className="absolute bottom-0 left-0 h-[2px]"
                                            style={{
                                                width: `max(0%, min(calc(100% + (var(--pos, 0) - ${i}) * 100%), calc(100% - (var(--pos, 0) - ${i}) * 100%)))`,
                                                backgroundColor: ACCENT,
                                            }}
                                        />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </section>

                {/* ---------- Introduction block ---------- */}
                <section
                    ref={introRef}
                    style={{ backgroundColor: BG }}
                    className="grid grid-cols-1 items-center gap-16 px-4 py-10 md:min-h-screen md:grid-cols-[1.25fr_1fr] md:gap-24 md:px-8 md:py-32"
                >
                    <p
                        className={`max-w-[14em] text-[7vw] font-medium leading-[1.15] tracking-[-0.02em] md:text-[2.9vw] md:transition-all md:duration-1000 md:ease-out ${revealClass}`}
                        style={reveal(0)}
                    >
                        {intro.statement}
                    </p>

                    <div className="flex flex-col gap-14 md:gap-20">
                        <div
                            className={`flex justify-center md:justify-start md:pl-6 md:transition-all md:duration-1000 md:ease-out ${revealClass}`}
                            style={reveal(150)}
                        >
                            <span className="text-sm font-semibold tracking-tight md:text-base">
                                ( {intro.label} )
                            </span>
                        </div>

                        <div className="flex max-w-[16rem] flex-col gap-10 md:gap-12">
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