import React, { useEffect, useRef, useState } from "react";

const MAX_TILT = 10; // degrees, 3D tilt (rotateX / rotateY)
const MAX_ROLL = 8; // degrees, flat rotation that leans with the cursor / phone
const FOLLOW = 30; // px, how far the image drifts
const REACH = 500; // px from the image where mouse effects hit their max
const GYRO_RANGE = 25; // degrees you tilt the phone for the full effect (smaller = more sensitive)
const EASE = 0.1; // 0-1, higher = snappier
const NEAR_SCALE = 1.7; // how much bigger it gets when "closer"
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function TiltImage({ src, alt = "" }) {
    const tiltRef = useRef(null);
    const glareRef = useRef(null);
    const shadowRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 }); // shared by mouse + gyro
    const gyroActiveRef = useRef(false);
    const baseRef = useRef(null); // phone's resting angle, set on the first reading
    const [near, setNear] = useState(false);

    // mouse follow + animation loop
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const target = targetRef.current;
        const current = { x: 0, y: 0 };
        let raf;

        const onMove = (e) => {
            // when the gyro is running, ignore finger drags so they don't fight it
            if (gyroActiveRef.current && e.pointerType === "touch") return;
            const el = tiltRef.current;
            if (!el) return;
            const r = el.parentElement.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            target.x = clamp((e.clientX - cx) / REACH, -1, 1);
            target.y = clamp((e.clientY - cy) / REACH, -1, 1);
        };
        const onLeave = () => {
            if (gyroActiveRef.current) return;
            target.x = 0;
            target.y = 0;
        };

        const tick = () => {
            current.x += (target.x - current.x) * EASE;
            current.y += (target.y - current.y) * EASE;

            const rotY = current.x * MAX_TILT;
            const rotX = -current.y * MAX_TILT;
            const rotZ = current.x * MAX_ROLL;

            if (tiltRef.current) {
                tiltRef.current.style.transform =
                    `translate3d(${current.x * FOLLOW}px, ${current.y * FOLLOW}px, 0) ` +
                    `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
            }
            if (shadowRef.current) {
                shadowRef.current.style.transform = `translate(${-current.x * 10}px, ${-current.y * 10}px)`;
            }
            if (glareRef.current) {
                glareRef.current.style.backgroundImage = `radial-gradient(circle at ${50 + current.x * 50}% ${50 + current.y * 50}%, rgba(255,255,255,0.7), transparent 55%)`;
            }
            raf = requestAnimationFrame(tick);
        };

        window.addEventListener("pointermove", onMove);
        document.documentElement.addEventListener("mouseleave", onLeave);
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("mouseleave", onLeave);
            cancelAnimationFrame(raf);
        };
    }, []);

    // gyro: starts a listener that feeds the same target the mouse uses
    const startGyro = () => {
        if (gyroActiveRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const onOrient = (e) => {
            if (e.beta == null || e.gamma == null) return; // no sensor (desktop)
            gyroActiveRef.current = true;

            // first reading = the angle you naturally hold the phone at
            if (!baseRef.current) baseRef.current = { beta: e.beta, gamma: e.gamma };

            // landscape swaps the axes
            const angle = (screen.orientation && screen.orientation.angle) || 0;
            let dx = e.gamma - baseRef.current.gamma; // left / right
            let dy = e.beta - baseRef.current.beta; // toward / away
            if (angle === 90 || angle === -90 || angle === 270) {
                [dx, dy] = [dy * (angle === 90 ? -1 : 1), dx * (angle === 90 ? 1 : -1)];
            }

            targetRef.current.x = clamp(dx / GYRO_RANGE, -1, 1);
            targetRef.current.y = clamp(dy / GYRO_RANGE, -1, 1);
        };

        window.addEventListener("deviceorientation", onOrient);
    };

    // Android / most browsers: no permission needed, start right away.
    // iOS: needs a tap first, handled in enableGyro() below.
    useEffect(() => {
        if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
        if (typeof DeviceOrientationEvent.requestPermission !== "function") startGyro();
    }, []);

    // iOS 13+ asks permission, and only from a tap
    const enableGyro = async () => {
        if (gyroActiveRef.current) return;
        if (typeof DeviceOrientationEvent === "undefined") return;
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
            try {
                const res = await DeviceOrientationEvent.requestPermission();
                if (res === "granted") startGyro();
            } catch {
                /* user denied or not supported */
            }
        }
    };

    // Esc pushes it back
    useEffect(() => {
        if (!near) return;
        const onKey = (e) => e.key === "Escape" && setNear(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [near]);

    const toggle = () => {
        enableGyro(); // the first tap on iOS turns the gyro on
        setNear((n) => !n);
    };

    return (
        <div className="tilt-enter relative z-20" style={{ perspective: "700px" }}>
            <div className="tilt-float">
                <div
                    role="button"
                    tabIndex={0}
                    aria-label={near ? "Move image back" : "Bring image closer"}
                    onClick={toggle}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle();
                        }
                    }}
                    className="cursor-pointer outline-none"
                    style={{
                        transform: `scale(${near ? NEAR_SCALE : 1})`,
                        transition: "transform 700ms cubic-bezier(.2,.9,.3,1.1)",
                    }}
                >
                    <div
                        ref={tiltRef}
                        className="relative will-change-transform"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <img
                            ref={shadowRef}
                            src={src}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full select-none"
                            style={{
                                filter: "brightness(0) blur(8px)",
                                opacity: 0.2,
                                translate: "0 0 -30px",
                            }}
                        />
                        <img
                            src={src}
                            alt={alt}
                            draggable="false"
                            className="relative w-full select-none"
                        />
                        <div
                            ref={glareRef}
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                            style={{
                                WebkitMaskImage: `url(${src})`,
                                maskImage: `url(${src})`,
                                WebkitMaskSize: "100% 100%",
                                maskSize: "100% 100%",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes tiltEnter {
                    from { opacity: 0; transform: translateY(50px) scale(0.85) rotate(-6deg); }
                    to   { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
                }
                @keyframes tiltFloat {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-10px); }
                }
                .tilt-enter { animation: tiltEnter 1100ms cubic-bezier(.2,.9,.3,1.2) 400ms both; }
                .tilt-float { animation: tiltFloat 4s ease-in-out 1.5s infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .tilt-enter, .tilt-float { animation: none; }
                }
            `}</style>
        </div>
    );
}

export default TiltImage;