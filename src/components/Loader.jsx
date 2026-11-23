import React, { useEffect, useRef, useState } from "react";

const MIN_TIME = 1400; // ms, minimum time the loader stays so it never just flashes
const MAX_TIME = 8000; // ms, give up waiting (slow network / broken image) and show the site anyway
const EXIT_TIME = 900; // ms, curtain lift animation
const BG = "#f8f5ef";
const INK = "#140605";
const RED = "#e0301e";

// Loads (and decodes) one image. Always resolves, even on error, so one broken file can't hang the page.
const preload = (src) =>
    new Promise((resolve) => {
        const img = new Image();
        img.onload = () =>
            img.decode ? img.decode().catch(() => {}).finally(resolve) : resolve();
        img.onerror = resolve;
        img.src = src;
    });

/**
 * images   : array of URLs that MUST be ready before the site shows (hero images etc.)
 * prefetch : array of URLs to quietly load afterwards, without making anyone wait
 * onReveal : called when the curtain starts lifting (mount your page here)
 * onDone   : called when the loader is fully gone (unmount it here)
 */
function Loader({ images = [], prefetch = [], onReveal, onDone }) {
    const [progress, setProgress] = useState(0); // 0-100, what is shown
    const [leaving, setLeaving] = useState(false);
    const shownRef = useRef(0);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden"; // no scrolling behind the loader
        window.scrollTo(0, 0);

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const minTime = reduceMotion ? 300 : MIN_TIME;

        const total = images.length;
        let loaded = 0;
        let fontsOk = false;
        let raf;
        let exitTimer;
        let finished = false;
        const start = performance.now();

        images.forEach((src) =>
            preload(src).then(() => {
                loaded += 1;
            })
        );
        (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsOk = true));

        const finish = () => {
            if (finished) return;
            finished = true;
            setProgress(100);
            setLeaving(true);
            onReveal && onReveal();
            // quietly warm the cache for below-the-fold images
            prefetch.forEach((src) => preload(src));
            exitTimer = setTimeout(() => onDone && onDone(), EXIT_TIME);
        };

        const tick = (now) => {
            const elapsed = now - start;
            const imgRatio = total ? loaded / total : 1;
            const real = Math.min(imgRatio, fontsOk ? 1 : 0.95);
            const timed = Math.min(elapsed / minTime, 1);
            const timedOut = elapsed > MAX_TIME;
            // never run ahead of what is really loaded, and never faster than MIN_TIME
            const target = timedOut ? 1 : Math.min(real, timed);

            shownRef.current += (target - shownRef.current) * 0.12;
            const pct = Math.min(100, Math.round(shownRef.current * 100));
            setProgress((p) => (p === pct ? p : pct));

            if (target >= 1 && shownRef.current > 0.995) {
                finish();
                return;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(exitTimer);
            document.body.style.overflow = prevOverflow;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // unlock scrolling as soon as the curtain starts to lift
    useEffect(() => {
        if (leaving) document.body.style.overflow = "";
    }, [leaving]);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={`Loading ${progress}%`}
            className="loader-font fixed inset-0 z-[200] flex flex-col justify-between overflow-hidden"
            style={{
                backgroundColor: BG,
                color: INK,
                transform: leaving ? "translateY(-100%)" : "translateY(0)",
                transition: `transform ${EXIT_TIME}ms cubic-bezier(.76,0,.24,1)`,
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;700&display=swap');
                .loader-font { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; }
            `}</style>

            {/* same grid as the hero, so the handoff feels continuous */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(20,6,5,0.12) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(20,6,5,0.12) 1px, transparent 1px)
                    `,
                    backgroundSize: "56px 56px",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                    maskImage: "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                }}
            />

            {/* top row */}
            <div className="relative flex items-start justify-between px-4 pt-5 text-[10px] font-bold uppercase tracking-tight md:px-8 md:pt-8 md:text-[12px]">
                <span>Vyshnav</span>
                <span>Portfolio — Loading</span>
            </div>

            {/* scribble that draws itself as the progress goes up */}
            <svg
                aria-hidden="true"
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-0 right-0 top-1/2 h-[28vh] w-full -translate-y-1/2"
            >
                <path
                    d="M -20 120 C 80 20, 140 190, 240 110 S 380 30, 470 120 S 600 200, 700 90 S 860 20, 1020 100"
                    pathLength="1"
                    fill="none"
                    stroke={RED}
                    strokeOpacity="0.85"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{
                        strokeDasharray: 1,
                        strokeDashoffset: 1 - progress / 100,
                    }}
                />
            </svg>

            {/* bottom row: big counter */}
            <div className="relative flex items-end justify-between px-4 pb-3 md:px-8 md:pb-5">
                <span
                    className="font-bold leading-[0.8] tracking-[-0.06em] tabular-nums"
                    style={{ fontSize: "min(28vw, 42vh)" }}
                >
                    {String(progress).padStart(3, "0")}
                </span>
                <span className="mb-2 max-w-[9rem] text-right text-[10px] font-bold uppercase leading-[1.3] tracking-tight md:mb-4 md:text-[12px]">
                    Getting things ready
                </span>
            </div>

            {/* thin progress bar along the very bottom */}
            <div className="relative h-[3px] w-full" style={{ backgroundColor: "rgba(20,6,5,0.12)" }}>
                <div
                    className="h-full"
                    style={{ width: `${progress}%`, backgroundColor: RED }}
                />
            </div>
        </div>
    );
}

export default Loader;