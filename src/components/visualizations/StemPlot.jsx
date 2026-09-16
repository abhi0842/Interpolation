import { useEffect, useRef, useState } from "react";
import styles from "./plot.module.css";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function setupCanvas(cv, baseH) {
  const h = baseH;
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  cv.width = Math.max(1, Math.round(rect.width * dpr));
  cv.height = Math.round(h * dpr);
  cv.style.height = h + "px";
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h };
}

export default function StemPlot({
  samples = [],
  markZeros = false,
  L = 3,
  filtered = false,
  smoothGuide = false,
  label = "",
  height = 170,
  reveal = 1,
}) {
  const canvasRef = useRef(null);
  const [hover, setHover] = useState(null);

  const render = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv, height);
    ctx.clearRect(0, 0, w, h);
    const padL = 28,
      padR = 12,
      padB = 22,
      padT = 16;
    const plotW = w - padL - padR;
    const plotH = h - padB - padT;
    const mid = padT + plotH / 2;
    const N = samples.length;
    if (N < 1) return;

    const maxA = Math.max(...samples.map(Math.abs), 0.15);
    const scale = (plotH / 2 - 6) / maxA;

    ctx.strokeStyle = "#d0dcef";
    ctx.beginPath();
    ctx.moveTo(padL, mid);
    ctx.lineTo(w - padR, mid);
    ctx.stroke();

    const shown = Math.max(1, Math.round(N * Math.max(0, Math.min(1, reveal))));

    if (smoothGuide) {
      ctx.strokeStyle = "rgba(5,150,105,0.28)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < shown; i++) {
        const x = padL + (N === 1 ? plotW / 2 : (i / (N - 1)) * plotW);
        const y = mid - samples[i] * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let i = 0; i < shown; i++) {
      const x = padL + (N === 1 ? plotW / 2 : (i / (N - 1)) * plotW);
      const y = mid - samples[i] * scale;
      const isOrig = markZeros && i % L === 0;
      const hovered = hover && hover.i === i;

      if (markZeros) {
        if (isOrig) {
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(x, mid);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.fillStyle = "#2563eb";
          ctx.beginPath();
          ctx.arc(x, y, hovered ? 5.2 : 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(x, mid, hovered ? 3.6 : 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (filtered) {
        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, mid);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.arc(x, y, hovered ? 3.8 : 2.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, mid);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.arc(x, y, hovered ? 4.6 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "#5a6f8f";
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = "left";
    ctx.fillText(label, padL, 12);

    if (hover && hover.i >= 0 && hover.i < shown) {
      const i = hover.i;
      const v = samples[i];
      const txt =
        "n=" + i + "  ·  x=" + (Math.abs(v) < 1e-6 ? "0" : v.toFixed(3));
      ctx.font = '11px "JetBrains Mono", monospace';
      const textW = ctx.measureText(txt).width + 16;
      let boxX = hover.x - textW / 2;
      boxX = Math.max(padL, Math.min(boxX, w - padR - textW));
      ctx.fillStyle = "rgba(26,43,74,0.92)";
      roundRect(ctx, boxX, 4, textW, 20, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(txt, boxX + textW / 2, 18);
    }
  };

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  const handleMove = (e) => {
    const cv = canvasRef.current;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const N = samples.length;
    if (N < 1) return;
    const padL = 28,
      padR = 12;
    const plotW = rect.width - padL - padR;
    const frac = (mx - padL) / plotW;
    const i = Math.max(0, Math.min(N - 1, Math.round(frac * (N - 1))));
    setHover({ x: mx, i });
  };

  return (
    <div className={styles.plotWrap}>
      <div className={styles.cvShell}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          style={{ height }}
        />
      </div>
    </div>
  );
}
