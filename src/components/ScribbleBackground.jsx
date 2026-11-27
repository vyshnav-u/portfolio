import React, { useEffect, useId, useRef } from "react";

// Wrap your Hero and About (and anything else) in this component.
// It owns the beige background and draws two red lines that keep growing.
// The lines live on the screen, not on the page: scrolling does not move them.
// Only the tip of each line moves. Everything already drawn stays exactly where it is.
// A line dissolves (fades + blurs out as a whole) when it gets long enough
// or when its tip leaves the screen, and then a new one starts.

const LINE_COLOR = "#e0301e"; // scribble color (red)
const BG = "#f8f5ef"; // shared page background

const LINES = 2; // how many lines (they start alternately from the left and right edge)
const SPEED = 110; // px per second the line tip travels
const MAX_LEN = 5000; // px a line may grow before it dissolves (~45 s). Lower = cleaner screen, higher = denser web
const MIN_LEN = 1500; // a line must be at least this long before leaving the screen can dissolve it (new lines start off-screen)
const EXIT_PAD = 20; // px past the screen edge the tip must go to count as "out of the screen"
const LEN_JITTER = 0.15; // each new line's limit varies by +/- this share, so lines don't dissolve in sync
const FIRST_STAGGER = 0.6; // the second line's first limit is this share of MAX_LEN, so the two are offset from the start
const FADE_TIME = 2; // seconds a line takes to dissolve completely
const BLUR_MAX = 14; // blur radius (px) a line reaches as it disappears
const WANDER = 0.006; // how sharply a line can curve (rad per px); higher = windier
const STEER = 0.012; // how firmly a line turns back when it strays too far
const OUTSIDE = 80; // px outside the screen before a line turns back in
const SPACING = 12; // px between points on the line
const OPACITY = 0.8;

const rand = (min, max) => Math.random() * (max - min) + min;
const wrapAngle = (a) => {
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    return a;
};
const f = (n) => n.toFixed(1);

// One smooth piece of the curve from pts[i] to pts[i+1] (Catmull-Rom -> cubic Bezier)
const segment = (pts, i) => {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    return ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`;
};

// A new line starts just outside the left or right edge of the screen and heads inward
const makeLine = (index, w, h, first = false) => {
    const fromLeft = index % 2 === 0;
    const x = fromLeft ? -OUTSIDE : w + OUTSIDE;
    const y = h * rand(0.25, 0.75);
    // the very first lines are offset from each other; later lines get a random length
    const max = first
        ? MAX_LEN * (index === 0 ? 1 : FIRST_STAGGER)
        : MAX_LEN * rand(1 - LEN_JITTER, 1 + LEN_JITTER);
    return {
        x,
        y,
        a: (fromLeft ? 0 : Math.PI) + rand(-0.4, 0.4), // heading
        curv: 0,
        target: 0,
        nextPick: 0,
        pts: [{ x, y }],
        seg: 0, // how many pieces are already finished and frozen into `done`
        done: `M ${f(x)} ${f(y)}`, // the frozen part of the line
        len: 0,
        max, // length at which this line starts to dissolve
        fade: 0, // > 0 while the line is dissolving
    };
};

export default function ScribbleBackground({ children }) {
    const wrapRef = useRef(null);
    const groupRefs = useRef([]);
    const doneRefs = useRef([]);
    const liveRefs = useRef([]);
    const blurRefs = useRef([]);
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

    useEffect(() => {
        // Skip the animation for people who prefer reduced motion
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let raf = 0;
        let lastT = performance.now();
        let lines = null;

        const reset = (i, w, h) => {
            lines[i] = makeLine(i, w, h);
            doneRefs.current[i]?.setAttribute("d", lines[i].done);
            liveRefs.current[i]?.setAttribute("d", "");
            const g = groupRefs.current[i];
            g?.removeAttribute("filter"); // the new line starts sharp
            g?.setAttribute("opacity", OPACITY);
        };

        const frame = (now) => {
            raf = requestAnimationFrame(frame);
            const dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;

            const el = wrapRef.current;
            if (!el || document.hidden) return;

            // the lines are drawn in screen coordinates, so scrolling never changes them
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (!lines) {
                lines = Array.from({ length: LINES }, (_, i) => makeLine(i, w, h, true));
                lines.forEach((l, i) => doneRefs.current[i]?.setAttribute("d", l.done));
            }

            const rect = el.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > h) return; // wrapper off screen: pause

            lines.forEach((line, i) => {
                // dissolve when the line gets long enough, or when its tip leaves the screen
                // (the blur filter is only attached from here on)
                const offScreen =
                    line.x < -EXIT_PAD || line.x > w + EXIT_PAD || line.y < -EXIT_PAD || line.y > h + EXIT_PAD;
                if (line.fade === 0 && (line.len > line.max || (offScreen && line.len > MIN_LEN))) {
                    line.fade = 0.0001;
                    groupRefs.current[i]?.setAttribute("filter", `url(#scribble-blur-${uid}-${i})`);
                }

                // dissolving: the whole line fades and blurs evenly, and stops growing
                if (line.fade > 0) {
                    line.fade += dt;
                    const t = Math.min(line.fade / FADE_TIME, 1);
                    groupRefs.current[i]?.setAttribute("opacity", (OPACITY * (1 - t)).toFixed(3));
                    blurRefs.current[i]?.setAttribute("stdDeviation", (t * BLUR_MAX).toFixed(2));
                    if (t >= 1) reset(i, w, h);
                    return;
                }

                const step = SPEED * dt;

                // pick a new random curve every second or two, eased in smoothly
                line.nextPick -= dt;
                if (line.nextPick <= 0) {
                    line.target = rand(-WANDER, WANDER);
                    line.nextPick = rand(0.8, 2.2);
                }
                line.curv += (line.target - line.curv) * Math.min(1, dt * 2);
                line.a += line.curv * step;

                // if it strays too far outside the screen, curve back toward the middle
                const out =
                    line.x < -OUTSIDE || line.x > w + OUTSIDE || line.y < -OUTSIDE || line.y > h + OUTSIDE;
                if (out) {
                    const want = Math.atan2(h / 2 - line.y, w / 2 - line.x);
                    const diff = wrapAngle(want - line.a);
                    line.a += Math.max(-1, Math.min(1, diff)) * STEER * step;
                }

                line.x += Math.cos(line.a) * step;
                line.y += Math.sin(line.a) * step;

                // every SPACING px add a point, and freeze finished pieces so they never change again
                const lastPt = line.pts[line.pts.length - 1];
                const gap = Math.hypot(line.x - lastPt.x, line.y - lastPt.y);
                if (gap >= SPACING) {
                    line.pts.push({ x: line.x, y: line.y });
                    line.len += gap;
                    let added = false;
                    while (line.seg + 2 < line.pts.length) {
                        line.done += segment(line.pts, line.seg);
                        line.seg++;
                        added = true;
                    }
                    if (added) doneRefs.current[i]?.setAttribute("d", line.done);
                }

                // the live part: only the last few pieces up to the tip are redrawn each frame
                line.pts.push({ x: line.x, y: line.y });
                let d = `M ${f(line.pts[line.seg].x)} ${f(line.pts[line.seg].y)}`;
                for (let k = line.seg; k < line.pts.length - 1; k++) d += segment(line.pts, k);
                line.pts.pop();
                liveRefs.current[i]?.setAttribute("d", d);
            });
        };

        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [uid]);

    const pathProps = {
        fill: "none",
        stroke: LINE_COLOR,
        strokeWidth: "1.4",
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    return (
        // `isolate` keeps the lines (negative z-index) inside this wrapper, above the beige
        // but behind every section's content. Do not add overflow-hidden here: it would break
        // the sticky scrolling in the About section.
        <div
            ref={wrapRef}
            className="relative isolate"
            style={{
                backgroundColor: BG,
                // clip (not hidden): the lines are cut off at the edge of this wrapper so they never
                // spill over the next section, and sticky scrolling inside still works
                overflow: "clip",
            }}
        >
            {/* zero-height sticky holder: it stays glued to the top of the screen while the
                wrapper scrolls, so the lines don't move with the page */}
            <div
                aria-hidden="true"
                className="pointer-events-none sticky top-0 h-0"
                style={{ zIndex: -5 }}
            >
                <svg className="absolute left-0 top-0 h-screen w-full">
                    <defs>
                        {Array.from({ length: LINES }, (_, i) => (
                            <filter
                                key={i}
                                id={`scribble-blur-${uid}-${i}`}
                                filterUnits="userSpaceOnUse"
                                x="-200"
                                y="-200"
                                width="6000"
                                height="4000"
                            >
                                <feGaussianBlur ref={(n) => (blurRefs.current[i] = n)} stdDeviation="0" />
                            </filter>
                        ))}
                    </defs>
                    {Array.from({ length: LINES }, (_, i) => (
                        <g key={i} ref={(n) => (groupRefs.current[i] = n)} opacity={OPACITY}>
                            <path ref={(n) => (doneRefs.current[i] = n)} {...pathProps} />
                            <path ref={(n) => (liveRefs.current[i] = n)} {...pathProps} />
                        </g>
                    ))}
                </svg>
            </div>

            {children}
        </div>
    );
}