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

function drawFreqAxis(ctx, w, h, maxFreq, padL, padB, padT) {
  ctx.strokeStyle = "#d0dcef";
  ctx.fillStyle = "#5a6f8f";
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.lineWidth = 1;
  const plotW = w - padL - 10;
  for (let i = 0; i <= 4; i++) {
    const f = (maxFreq / 4) * i;
    const x = padL + (f / maxFreq) * plotW;
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, h - padB);
    ctx.stroke();
    ctx.textAlign = i === 4 ? "right" : "center";
    ctx.fillText(Math.round(f), x, h - padB + 12);
  }
  ctx.strokeStyle = "#93b4e8";
  ctx.beginPath();
  ctx.moveTo(padL, h - padB);
  ctx.lineTo(w - 6, h - padB);
  ctx.stroke();
}

export default function InterpSpectrum({
  peaks = [],
  maxFreq,
  basebandTo,
  imageZones,
  limitLine,
  limitLabel = "π/L",
  limitLines,
  shadeAbove,
  removedLabel,
  respCurve,
  respMax,
  height = 160,
  legend,
}) {
  const canvasRef = useRef(null);
  const [hover, setHover] = useState(null);

  const render = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv, height);
    ctx.clearRect(0, 0, w, h);
    const padL = 32,
      padB = 22,
      padT = 14;
    const plotW = w - padL - 10;
    const plotH = h - padB - padT;
    drawFreqAxis(ctx, w, h, maxFreq, padL, padB, padT);

    if (basebandTo != null) {
      const x1 = padL + (basebandTo / maxFreq) * plotW;
      ctx.fillStyle = "rgba(37,99,235,0.09)";
      ctx.fillRect(padL, padT, Math.max(0, x1 - padL), plotH);
      ctx.fillStyle = "#2563eb";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      if (x1 - padL > 55) ctx.fillText("baseband (squeezed)", padL + (x1 - padL) / 2, padT + 10);
    }
    if (imageZones) {
      imageZones.forEach(([lo, hi]) => {
        const x0 = padL + (lo / maxFreq) * plotW;
        const x1 = padL + (hi / maxFreq) * plotW;
        ctx.fillStyle = "rgba(124,58,237,0.08)";
        ctx.fillRect(x0, padT, Math.max(1, x1 - x0), plotH);
      });
    }
    if (limitLine != null) {
      const x0 = padL + (limitLine / maxFreq) * plotW;
      ctx.strokeStyle = "#d97706";
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x0, padT);
      ctx.lineTo(x0, h - padB);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#d97706";
      ctx.font = '9.5px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(limitLabel, Math.min(x0 + 3, w - 50), padT + 10);
    }
    if (limitLines) {
      limitLines.forEach((ln) => {
        const x0 = padL + (ln.freq / maxFreq) * plotW;
        ctx.strokeStyle = ln.color;
        ctx.lineWidth = 1.4;
        ctx.setLineDash(ln.dash || []);
        ctx.beginPath();
        ctx.moveTo(x0, padT);
        ctx.lineTo(x0, h - padB);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ln.color;
        ctx.font = '9.5px "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        ctx.fillText(ln.label || "", Math.min(x0 + 3, w - 70), ln.labelY || padT + 10);
      });
    }
    if (shadeAbove != null) {
      const x0 = padL + (shadeAbove / maxFreq) * plotW;
      ctx.fillStyle = "rgba(148,163,184,0.15)";
      ctx.fillRect(x0, padT, w - 10 - x0, plotH);
      if (removedLabel && w - 10 - x0 > 50) {
        ctx.fillStyle = "#64748b";
        ctx.font = '9.5px "JetBrains Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillText(removedLabel, x0 + (w - 10 - x0) / 2, padT + plotH / 2);
      }
    }
    if (respCurve) {
      const maxResp = respMax || Math.max(...respCurve.map((p) => p.mag), 0.001);
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, plotW, plotH);
      ctx.clip();
      ctx.beginPath();
      respCurve.forEach((p, i) => {
        const x = padL + (p.f / maxFreq) * plotW;
        const yv = Math.min(1, p.mag / maxResp);
        const y = h - padB - yv * (plotH - 14);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(5,150,105,0.85)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.lineTo(padL + plotW, h - padB);
      ctx.lineTo(padL, h - padB);
      ctx.closePath();
      ctx.fillStyle = "rgba(5,150,105,0.08)";
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(padL, padT, plotW, plotH);
    ctx.clip();
    const maxA = Math.max(...peaks.map((p) => p.a), 0.001, 1);
    peaks.forEach((p) => {
      if (p.f > maxFreq + 0.5) return;
      const x = padL + (p.f / maxFreq) * plotW;
      const an = Math.max(p.a / maxA, 0.08);
      const y0 = h - padB;
      const y1 = y0 - an * (plotH - 14);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.isImage ? 2 : 2.6;
      if (p.isImage) ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y1, p.isImage ? 3 : 3.6, 0, Math.PI * 2);
      ctx.fill();
      if (p.label) {
        ctx.fillStyle = p.color;
        ctx.font = '9.5px "JetBrains Mono", monospace';
        ctx.textAlign = "center";
        const ly = y1 - 8 < padT + 12 ? y1 + 13 : y1 - 7;
        ctx.fillText(p.label, x, ly);
      }
    });
    ctx.restore();

    if (hover) {
      const mx = hover.x;
      if (mx >= padL && mx <= w - 6) {
        const freq = ((mx - padL) / plotW) * maxFreq;
        let nearest = null;
        let nearestDist = 16;
        peaks.forEach((p) => {
          const tx = padL + (p.f / maxFreq) * plotW;
          const d = Math.abs(tx - mx);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = p;
          }
        });
        const label = nearest
          ? `${Math.round(nearest.f)} Hz · ${nearest.label || ""} · a=${nearest.a.toFixed(2)}`
          : `${Math.round(freq)} Hz`;
        ctx.strokeStyle = "rgba(37,99,235,0.45)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(mx, padT);
        ctx.lineTo(mx, h - padB);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '11px "JetBrains Mono", monospace';
        const textW = ctx.measureText(label).width + 16;
        let boxX = mx - textW / 2;
        boxX = Math.max(padL, Math.min(boxX, w - 6 - textW));
        ctx.fillStyle = "rgba(26,43,74,0.92)";
        roundRect(ctx, boxX, 4, textW, 20, 6);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(label, boxX + textW / 2, 18);
      }
    }
  };

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  return (
    <div className={styles.plotWrap}>
      <div className={styles.cvShell}>
        <canvas
          ref={canvasRef}
          onMouseMove={(e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            setHover({ x: e.clientX - rect.left });
          }}
          onMouseLeave={() => setHover(null)}
          style={{ height }}
        />
      </div>
      {legend && (
        <div className={styles.legend}>
          {legend.map((item, i) => (
            <span key={i}>
              <i style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
