import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
// npm i three
import * as THREE from "three";

const images = [
  { src: "/projects/E-FIT/EFIT Home.png", name: "EFIT Home page" },
  { src: "/projects/PRODUCT PAGE/PRODUCT Home.png", name: "Landing Page" },
  { src: "/projects/BOOKSTORE/BOOSTORE Home.png", name: "Landing Page" },
  { src: "/projects/RETRO/RETRO Hero.png", name: "RETRO Hero Design" },
  { src: "/projects/BOOKSTORE/BOOKSTORE Footer.png", name: "Book Store Footer" },
  { src: "/projects/RETRO/RETRO About.png", name: "Typography Study" },
];

const INK = "#140605";
const RED = "#e0301e";

const AUTO_SPEED = 40; // px per second the strip drifts on its own (to the right)
const DRAG_THRESHOLD = 5; // px of movement before a press counts as a drag, not a click
const TILT = 0.1; // radians the ring leans toward you; more = deeper curve (0 = a flat band)
const CAMERA = 10; // camera distance as a multiple of the screen width; farther = gentler perspective

// size of one frame's texture
const TEX_W = 512;
const TEX_H = 440;

// Paints one film frame: dark body, the picture in the window, sprocket holes punched out (transparent)
function paintFrame(canvas, img, body) {
  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  const wx = 12;
  const wy = 50;
  const ww = TEX_W - 24;
  const wh = TEX_H - 100;
  if (img && img.naturalWidth) {
    const s = Math.max(ww / img.naturalWidth, wh / img.naturalHeight);
    const sw = ww / s;
    const sh = wh / s;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, wx, wy, ww, wh); // cover, top-aligned
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(wx, wy, ww, wh);
  }

  // 12 holes per frame so the rhythm carries on across every join
  ctx.globalCompositeOperation = "destination-out";
  const pitch = TEX_W / 12;
  const hw = pitch * 0.46;
  const hh = 22;
  for (let i = 0; i < 12; i++) {
    const hx = i * pitch + (pitch - hw) / 2;
    for (const hy of [14, TEX_H - 14 - hh]) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(hx, hy, hw, hh, 4);
      else ctx.rect(hx, hy, hw, hh);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

// background: any CSS colour/gradient to paint behind the strip (default: fully transparent).
// className: extra classes for the outer wrapper, e.g. a margin or a background utility.
function DesignShowcase({ background = "transparent", className = "" }) {
  const [selected, setSelected] = useState(null); // { src, name }
  const [hoverName, setHoverName] = useState("");

  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRef = useRef(null);

  // The strip is ONE continuous curved band (a ring of film) built in WebGL.
  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // transparent: only the film itself is drawn
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 60000);
    const tilt = new THREE.Group(); // leans the ring toward the viewer
    const spin = new THREE.Group(); // turns the ring around its own axis
    tilt.add(spin);
    scene.add(tilt);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const tmp = new THREE.Vector3();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // one texture per picture, in a dark and a red (hover) version
    const sets = images.map((item) => {
      const make = (body) => {
        const c = document.createElement("canvas");
        c.width = TEX_W;
        c.height = TEX_H;
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
        return { c, t, body };
      };
      const set = { ink: make(INK), red: make(RED), img: new Image() };
      paintFrame(set.ink.c, null, INK);
      paintFrame(set.red.c, null, RED);
      set.img.onload = () => {
        for (const v of [set.ink, set.red]) {
          paintFrame(v.c, set.img, v.body);
          v.t.needsUpdate = true;
        }
      };
      set.img.src = encodeURI(item.src);
      return set;
    });

    let meshes = [];
    let R = 1000; // ring radius in px
    let dTheta = 0.1;
    let frameH = 100;
    let vw = 1;
    let H = 300;

    let angle = 0; // current rotation of the ring
    let vel = 0; // rad per second
    let dragging = false;
    let moved = false;
    let hoverIdx = -1;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;

    const disposeRing = () => {
      for (const m of meshes) {
        spin.remove(m);
        m.geometry.dispose();
        m.material.dispose();
      }
      meshes = [];
    };

    const build = () => {
      disposeRing();
      hoverIdx = -1;
      vw = box.clientWidth || 1;

      const pxF = vw >= 768 ? 144 : vw >= 640 ? 128 : 112; // frame width: the size you started with
      frameH = pxF * (TEX_H / TEX_W);

      // number of frames around the ring: a multiple of the picture count, wide enough that the sides leave the screen
      const n = images.length;

      // Camera distance. The ring is made big enough that the visible part of the strip
      // (after perspective shrinks the sides) still runs past both edges of the screen.
      const D = Math.max(vw * CAMERA, 900);
      const visibleEnd = (r) => {
        const t = Math.acos(r / (D + r)); // where the strip turns edge-on for the camera
        return (r * Math.sin(t) * D) / (D + r * (1 - Math.cos(t))); // its screen x
      };
      let F = Math.ceil((Math.PI * 2 * vw * 0.6) / pxF / n) * n;
      while (visibleEnd((pxF * F) / (Math.PI * 2)) < vw * 0.58 && F < n * 200) F += n;

      dTheta = (Math.PI * 2) / F;
      R = pxF / dTheta;

      // angle around the ring where the strip reaches the screen edge (used to size the curve)
      const tTan = Math.acos(R / (D + R));
      let thetaEdge = tTan;
      for (let t = 0.02; t < tTan; t += 0.02) {
        if ((R * Math.sin(t) * D) / (D + R * (1 - Math.cos(t))) >= vw / 2) {
          thetaEdge = t;
          break;
        }
      }
      const sag = R * Math.sin(TILT) * (1 - Math.cos(thetaEdge));
      H = Math.ceil(frameH + sag + 90);

      // The wrapper owns the height; the canvas is absolutely positioned and
      // fills it, so its pixel size can never hold the wrapper's width open.
      renderer.setSize(vw, H, false);
      box.style.height = `${H}px`;

      camera.aspect = vw / H;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(H / 2 / D)); // keeps 1 unit = 1 px at the front of the strip
      camera.position.set(0, 0, D);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      tilt.rotation.x = TILT;
      tilt.position.set(0, (R * Math.sin(TILT) * (1 + Math.cos(thetaEdge))) / 2, -R * Math.cos(TILT));

      for (let k = 0; k < F; k++) {
        // one slice of the SAME cylinder per frame, so the band is perfectly continuous
        const geo = new THREE.CylinderGeometry(R, R, frameH, 10, 1, true, k * dTheta, dTheta);
        const mat = new THREE.MeshBasicMaterial({
          map: sets[k % n].ink.t,
          transparent: true,
          side: THREE.FrontSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData.index = k;
        spin.add(mesh);
        meshes.push(mesh);
      }
    };

    build();

    // Rebuild only when the width actually changes (height changes come from build itself)
    let lastW = box.clientWidth;
    const ro = new ResizeObserver(() => {
      const w = box.clientWidth;
      if (w === lastW) return;
      lastW = w;
      build();
    });
    ro.observe(box);

    const autoSpeed = () => (reduce || hoverIdx >= 0 ? 0 : AUTO_SPEED / R);
    vel = autoSpeed();

    const pick = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(spin.children, false)[0];
      return hit ? hit.object.userData.index : -1;
    };

    const setHover = (idx) => {
      if (idx === hoverIdx) return;
      if (hoverIdx >= 0 && meshes[hoverIdx]) meshes[hoverIdx].material.map = sets[hoverIdx % images.length].ink.t;
      hoverIdx = idx;
      if (idx >= 0 && meshes[idx]) meshes[idx].material.map = sets[idx % images.length].red.t;
      setHoverName(idx >= 0 ? images[idx % images.length].name : "");
    };

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
    };

    const onMove = (e) => {
      if (dragging) {
        if (!moved) {
          if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD) return;
          moved = true;
          setHover(-1);
          canvas.style.cursor = "grabbing";
          canvas.setPointerCapture?.(e.pointerId);
        }
        const now = performance.now();
        const dx = e.clientX - lastX;
        const dt = Math.max(now - lastT, 1);
        angle += dx / R; // the surface follows your finger
        vel = vel * 0.6 + ((dx / R / dt) * 1000) * 0.4; // flick speed
        lastX = e.clientX;
        lastT = now;
        return;
      }
      if (e.pointerType === "mouse") setHover(pick(e));
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "grab";
      if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if (!moved) {
        const idx = pick(e);
        if (idx >= 0) setSelected(images[idx % images.length]);
      }
    };

    const onLeave = (e) => {
      if (!dragging && e.pointerType === "mouse") setHover(-1);
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let prev = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - prev, 50);
      prev = now;

      if (!dragging) {
        vel += (autoSpeed() - vel) * Math.min(dt / 500, 1); // flick eases back to the slow drift
        angle += (vel * dt) / 1000;
      }
      spin.rotation.y = angle;

      // dim the other frames while one is hovered
      for (const m of meshes) {
        const target = hoverIdx < 0 || m.userData.index === hoverIdx ? 1 : 0.45;
        m.material.opacity += (target - m.material.opacity) * Math.min(dt / 150, 1);
      }

      // name label rides above the hovered frame (desktop only)
      const label = labelRef.current;
      if (label) {
        if (hoverIdx >= 0 && vw >= 768 && meshes[hoverIdx]) {
          tilt.updateMatrixWorld(true);
          const th = (hoverIdx + 0.5) * dTheta;
          tmp.set(R * Math.sin(th), frameH / 2, R * Math.cos(th));
          meshes[hoverIdx].localToWorld(tmp);
          tmp.project(camera);
          const px = (tmp.x * 0.5 + 0.5) * vw;
          const py = (-tmp.y * 0.5 + 0.5) * H;
          label.style.transform = `translate(${px}px, ${py - 10}px) translate(-50%, -100%)`;
          label.style.opacity = "1";
        } else {
          label.style.opacity = "0";
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      disposeRing();
      for (const s of sets) {
        s.ink.t.dispose();
        s.red.t.dispose();
      }
      renderer.dispose();
    };
  }, []);

  // Lightbox: Escape closes, page scroll locked while open
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

  return (
    <>
      {/* Transparent strip: drag it sideways with mouse or finger */}
      <div
        ref={boxRef}
        className={`relative w-full min-w-0 max-w-full select-none overflow-hidden ${className}`}
        style={{ background }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          style={{ touchAction: "pan-y", background: "transparent" }}
          aria-label="Design showcase film strip. Drag to move, click a frame to open it."
        />
        <div
          ref={labelRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 hidden whitespace-nowrap text-xs tracking-[0.2em] opacity-0 transition-opacity duration-300 md:block"
          style={{ color: INK }}
        >
          {hoverName}
        </div>
      </div>

      {/* Lightbox (portaled to <body> so nothing can sit above it) */}
      {selected &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/85 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:p-10"
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
          </div>,
          document.body
        )}
    </>
  );
}

export default DesignShowcase;