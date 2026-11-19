import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import AnimatedName from "./AnimatedName";
import DesignShowcase from "./DesignShowcase";
import TiltImage from "./TiltImage";

const GRID_SIZE = 56; // px, size of each square
const GRID_COLOR = "rgba(20, 6, 5, 0.12)"; // grid line color
const LINE_COLOR = "#e0301e"; // scribble color (red)

const SPAWN_EVERY = 3500; // ms between new scribbles
const DRAW_TIME = 4500; // ms for a scribble to draw across the screen
const LIFE_TIME = 7500; // ms before a scribble is removed
const MAX_LINES = 2; // most scribbles on screen at once
const POINTS = 9; // more points = windier scribble
const OUTSIDE = 80; // px outside the screen where scribbles start and end

const rand = (min, max) => Math.random() * (max - min) + min;

// Turns a list of points into one smooth curve (Catmull-Rom -> cubic Bezier)
const smooth = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
};

// A random point just outside one side of the screen (0 top, 1 right, 2 bottom, 3 left)
const edgePoint = (side, w, h) => {
    if (side === 0) return { x: rand(0, w), y: -OUTSIDE };
    if (side === 1) return { x: w + OUTSIDE, y: rand(0, h) };
    if (side === 2) return { x: rand(0, w), y: h + OUTSIDE };
    return { x: -OUTSIDE, y: rand(0, h) };
};

// Starts outside the screen, wanders across it with random swings, and ends outside again
const makeScribble = (w, h) => {
    const startSide = Math.floor(Math.random() * 4);
    // end on a different side so the scribble always crosses the screen
    const endSide = (startSide + 1 + Math.floor(Math.random() * 3)) % 4;

    const start = edgePoint(startSide, w, h);
    const end = edgePoint(endSide, w, h);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len; // unit vector sideways to the path
    const ny = dx / len;
    const swing = Math.min(w, h) * 0.35; // how far it wanders off the straight path

    const pts = [start];
    for (let i = 1; i < POINTS; i++) {
        const t = i / POINTS;
        const side = rand(-1, 1) * swing;
        const along = rand(-0.06, 0.06) * len; // small forward/back jitter makes loops
        pts.push({
            x: start.x + dx * t + nx * side + (dx / len) * along,
            y: start.y + dy * t + ny * side + (dy / len) * along,
        });
    }
    pts.push(end);

    return smooth(pts);
};

function Hero() {
    const sectionRef = useRef(null);
    const idRef = useRef(0);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        // Skip the animation for people who prefer reduced motion
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const spawn = () => {
            const section = sectionRef.current;
            if (!section || document.hidden) return;

            const { width, height } = section.getBoundingClientRect();
            const id = idRef.current++;
            const d = makeScribble(width, height);

            setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), { id, d }]);
            setTimeout(() => setLines((prev) => prev.filter((l) => l.id !== id)), LIFE_TIME);
        };

        spawn();
        const timer = setInterval(spawn, SPAWN_EVERY);
        return () => clearInterval(timer);
    }, []);

    return (
        // `isolate` keeps the background layers (-z-10) inside this section,
        // so they sit behind all the content but above the beige.
        <section
            ref={sectionRef}
            className="relative isolate min-h-[60vh] md:min-h-[80vh] overflow-hidden bg-[#f8f5ef] text-[#140605]"
        >
            <style>{`
                @keyframes lineDraw {
                    from { stroke-dashoffset: 1; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes lineFade {
                    from { opacity: 1; }
                    to   { opacity: 0; }
                }
                .hero-line {
                    stroke-dasharray: 1;
                    stroke-dashoffset: 1;
                    animation:
                        lineDraw ${DRAW_TIME}ms ease-in-out forwards,
                        lineFade 1200ms ease-in ${LIFE_TIME - 1300}ms forwards;
                }
            `}</style>

            {/* Grid background: fades out into the beige */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100%]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${GRID_COLOR} 1px, transparent 1px),
                        linear-gradient(to bottom, ${GRID_COLOR} 1px, transparent 1px)
                    `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                    WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                    maskImage:
                        "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                }}
            />

            {/* Red scribbles: enter and leave from outside the screen, behind all content */}
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
            >
                {lines.map((l) => (
                    <path
                        key={l.id}
                        d={l.d}
                        pathLength="1"
                        fill="none"
                        stroke={LINE_COLOR}
                        strokeOpacity="0.8"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hero-line"
                    />
                ))}
            </svg>

            <Navbar />

            {/* Floating top image */}
            <div className="absolute hidden  w-100 overflow -right-60 md:-right-100 top-16 md:w-200 rotate-[40deg]">
                <img
                    src="/spike1.png"
                    alt="Portfolio visual"
                    className="object-contain"
                />
            </div>

            {/* Main Heading */}
            <div className="absolute left-1/2 top-35 z-100 md:top-[45%] w-full -translate-x-1/2 -translate-y-1/2 px-3">

                <AnimatedName />

                {/* Main Image */}
                <div className="w-35 md:w-57 overflow absolute left-1/2 top-35 md:top-[75%] -translate-x-1/2 -translate-y-1/2 rotate-[-5deg]">
                   <TiltImage src="/id.png" backSrc="/id-back.png" alt="Vyshnav ID card" />
                </div>

            </div>

            {/* Floating left image */}
            <div className="absolute hidden w-100 overflow -left-60 bottom-[30%] md:-left-100 md:w-200 rotate-[60deg]">
                <img
                    src="/spike1.png"
                    alt="Portrait"
                    className="object-contain"
                />
            </div>

            {/* Description */}
            <div className="absolute top-80 md:top-[90%] left-1/2 w-[85%] -translate-x-1/2 text-center md:bottom-[24%] md:w-150">


                <p className="text-[8px] leading-[1.5] tracking-wide md:text-[11px]">
                    Hey, I'm Vyshnav — a developer
                    <br />
                    turning ideas into meaningful digital experiences, building creative solutions and bringing concepts to life.
                    <br />
                    Check out my designs and explore what I've created.
                    <br />

                </p>


            </div>

        </section>
    );
}

export default Hero;