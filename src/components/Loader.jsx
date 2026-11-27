import React, { useEffect, useRef, useState } from "react";

const MIN_TIME = 1400; // ms, minimum time the loader stays so it never just flashes
const MAX_TIME = 8000; // ms, give up waiting (slow network / broken image) and show the site anyway
const EXIT_TIME = 900; // ms, curtain lift animation
const BG = "#f8f5ef";
const INK = "#140605";

const WORD = "LOADING";
const GLYPHS = "01ABCDEF#$%&@!<>/\\+=*?";
const SCRAMBLE_TICK = 45; // ms between letter changes (lower = faster flicker)
const RESOLVE_STEP = 2; // ticks each letter takes to lock in (higher = slower decode)
const HOLD_TICKS = 14; // ticks the finished word stays before it scrambles again

const randChar = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

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
    const [text, setText] = useState(WORD);
    const shownRef = useRef(0);

    // Hacker-style decoding text: letters flicker, then lock in left to right, then repeat
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const cycle = WORD.length * RESOLVE_STEP + HOLD_TICKS;
        let tick = 0;
        const id = setInterval(() => {
            const locked = Math.floor(tick / RESOLVE_STEP);
            let out = "";
            for (let i = 0; i < WORD.length; i++) {
                out += i < locked ? WORD[i] : randChar();
            }
            setText(out);
            tick = (tick + 1) % cycle;
        }, SCRAMBLE_TICK);
        return () => clearInterval(id);
    }, []);

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
            className="loader-font fixed inset-0 z-[200] overflow-hidden"
            style={{
                backgroundColor: BG,
                color: INK,
                transform: leaving ? "translateY(-100%)" : "translateY(0)",
                transition: `transform ${EXIT_TIME}ms cubic-bezier(.76,0,.24,1)`,
            }}
        >
            <style>{`
                .loader-font {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
                }
            `}</style>

            {/* percentage, small, top right */}
            <span
                aria-hidden="true"
                className="absolute right-4 top-4 text-[13px] font-bold tabular-nums tracking-tight md:right-8 md:top-6 md:text-[16px]"
            >
                {String(progress).padStart(3, "0")}%
            </span>

            {/* scrambling word, small, centered */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    aria-hidden="true"
                    className="text-[11px] font-bold uppercase tracking-[0.35em] md:text-[23px]"
                    style={{ minWidth: "9ch", textAlign: "center" }}
                >
                    {text}
                </span>
            </div>
        </div>
    );
}

export default Loader;