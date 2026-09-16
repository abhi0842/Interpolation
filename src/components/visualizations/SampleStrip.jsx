import styles from "./plot.module.css";

export default function SampleStrip({ samples, mode = "orig", L = 3, maxShow = 24 }) {
  const n = Math.min(samples.length, maxShow);
  return (
    <div className={styles.sampleStrip}>
      {Array.from({ length: n }, (_, i) => {
        const v = samples[i];
        let cls = styles.sampleChip;
        if (mode === "orig") cls += " " + styles.sampleChipOrig;
        else if (mode === "zeros") {
          cls += " " + (i % L === 0 ? styles.sampleChipOrig : styles.sampleChipZero);
        } else cls += " " + styles.sampleChipFilt;
        const txt = Math.abs(v) < 1e-6 ? "0" : v.toFixed(2);
        return (
          <span key={i} className={cls}>
            {txt}
          </span>
        );
      })}
      {samples.length > maxShow && <span className={styles.sampleChip}>…</span>}
    </div>
  );
}
