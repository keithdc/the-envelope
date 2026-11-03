import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import "./ScratchCard.css";

// How much of the foil must be cleared before we auto-reveal.
const FINISH_PERCENT = 55;
// Radius of the "eraser" brush in CSS pixels.
const BRUSH_RADIUS = 26;

/**
 * Stage 2: a circular scratch medallion. A gold-framed circle holds a photo
 * (passed via event.photo; a styled placeholder is shown until one is set).
 * A foil <canvas> sits on top of the circle — scratch it to reveal the photo.
 *
 * The canvas is a circular element (border-radius: 50%), so the foil only
 * ever covers the circle, not the whole screen.
 */
export default function ScratchCard({ event, onRevealed }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const revealedRef = useRef(false);
  const lastPointRef = useRef(null);
  const rafRef = useRef(null);
  const [percent, setPercent] = useState(0);
  const [faded, setFaded] = useState(false);

  // Paint the foil to fill the circular canvas. Repainted on resize.
  const paintFoil = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    // Bail if not laid out yet (zero size); the rAF in the effect retries.
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Soft champagne / rose-gold foil (muted, not a harsh yellow gold)
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "#e7d2c4");
    grad.addColorStop(0.5, "#f3e4d6");
    grad.addColorStop(1, "#d9bfae");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // gentle diagonal sheen
    const sheen = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    sheen.addColorStop(0.4, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.3)");
    sheen.addColorStop(0.6, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // small "scratch" label
    ctx.fillStyle = "rgba(140, 110, 95, 0.65)";
    const fontSize = Math.min(16, rect.width * 0.09);
    ctx.font = `600 ${fontSize}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("scratch", rect.width / 2, rect.height / 2);
  };

  useEffect(() => {
    // Paint after layout settles. Two rAFs guarantee the canvas has its final
    // CSS-computed size (calc(100% - 20px) depends on the parent circle).
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(paintFoil);
      rafRef.current = raf2;
    });
    const onResize = () => {
      if (!revealedRef.current) paintFoil();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf1);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const eraseTo = (pt) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const last = lastPointRef.current || pt;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    lastPointRef.current = pt;
  };

  const measure = () => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const image = ctx.getImageData(0, 0, width, height).data;

    let clear = 0;
    let total = 0;
    for (let i = 3; i < image.length; i += 16) {
      total++;
      if (image[i] === 0) clear++;
    }
    const pct = Math.round((clear / total) * 100);
    setPercent(pct);

    if (pct >= FINISH_PERCENT) {
      revealedRef.current = true;
      setFaded(true);
    }
  };

  const handleDown = (e) => {
    drawingRef.current = true;
    lastPointRef.current = null;
    eraseTo(getPos(e));
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleMove = (e) => {
    if (!drawingRef.current) return;
    eraseTo(getPos(e));
    if (Math.random() < 0.2) measure();
  };

  const handleUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    measure();
  };

  return (
    <div className="scratch-fill">
      <p className="eyebrow scratch-eyebrow">The Happy Couple</p>
      <h1 className="couple scratch-couple">{event.couple}</h1>

      {/* Circular scratch medallion */}
      <div className="medallion">
        <div className="medallion-ring">
          {/* The photo (or placeholder) revealed under the foil */}
          <div className="medallion-photo">
            {event.photo ? (
              <img src={event.photo} alt={event.couple} />
            ) : (
              <div className="photo-placeholder">
                <Heart className="photo-icon" aria-hidden="true" />
                <span className="photo-label">Your photo here</span>
              </div>
            )}
          </div>

          {/* Circular foil canvas on top */}
          <motion.canvas
            ref={canvasRef}
            className="medallion-canvas"
            animate={{ opacity: faded ? 0 : 1 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => {
              if (faded) onRevealed();
            }}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerLeave={handleUp}
            style={{ pointerEvents: faded ? "none" : "auto" }}
          />
        </div>
      </div>

      <p className="scratch-hint">
        {faded ? "Revealed!" : `Scratch the circle · ${percent}%`}
      </p>
    </div>
  );
}
