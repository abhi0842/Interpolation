import { useContext } from "react";
import { InterpolationContext } from "../../context/InterpolationContext";
import Panel from "../ui/Panel";
import Callout from "../ui/Callout";
import StemPlot from "../visualizations/StemPlot";
import InterpSpectrum from "../visualizations/InterpSpectrum";
import styles from "./Steps.module.css";

export default function Step4Output() {
  const {
    x,
    z,
    y,
    L,
    fs,
    fsNew,
    taps,
    cutoffHz,
    correctCutoff,
    imgs,
    zones,
    respCurve,
    filteredPeaks,
    leakRatio,
    toneRatio,
    filterVerdict,
    playStage,
    playingId,
    fmtHz,
    setCutoff,
  } = useContext(InterpolationContext);

  return (
    <div className={styles.stepWrap}>
      <div className={styles.stepHead}>
        <div className={styles.stepNum}>4</div>
        <div>
          <div className={styles.stepTitle}>(c) Output — and the difference your filter made</div>
          <div className={styles.stepDesc}>
            Same three panels as the lecture: original, zeros, then a real convolution.
            Listen to a leaky cutoff vs the correct π/L filter.
          </div>
        </div>
      </div>

      <div className={styles.threeCol}>
        <Panel title="(a) Original">
          <StemPlot samples={x} label="original" height={130} />
        </Panel>
        <Panel title="(b) Zero-stuffed">
          <StemPlot samples={z} markZeros L={L} label="zeros in" height={130} />
        </Panel>
        <Panel title="(c) Actually filtered (real convolution)">
          <StemPlot samples={y} filtered smoothGuide label="real filter output" height={130} />
        </Panel>
      </div>

      <div className={styles.sideBySide}>
        <div className={`${styles.compareCard} ${styles.bad}`}>
          <div className={styles.ct}>Spectrum after ↑L, with your filter&apos;s response overlaid</div>
          <InterpSpectrum
            peaks={imgs}
            maxFreq={fsNew / 2}
            basebandTo={fs / 2}
            imageZones={zones}
            respCurve={respCurve}
            respMax={L}
            height={140}
            legend={[
              { color: "#2563eb", label: "Baseband" },
              { color: "#7c3aed", label: "Images" },
              { color: "#059669", label: "|H(f)|" },
            ]}
            limitLines={[
              { freq: correctCutoff, color: "#d97706", dash: [4, 3], label: "correct π/L" },
              { freq: cutoffHz, color: "#2563eb", label: "your cutoff", labelY: 24 },
            ]}
          />
        </div>
        <div className={`${styles.compareCard} ${styles.good}`}>
          <div className={styles.ct}>Spectrum after your filter is actually applied</div>
          <InterpSpectrum
            peaks={filteredPeaks}
            maxFreq={fsNew / 2}
            basebandTo={fs / 2}
            height={140}
          />
        </div>
      </div>

      <Callout type={filterVerdict.type}>
        {`<b>Real ${taps.length}-tap FIR filter, cutoff ${fmtHz(cutoffHz)}:</b> Output rate = <b>${fmtHz(fsNew)}</b>. Passband gain restores the tone to <b>${Math.round(toneRatio * 100)}%</b> of its true amplitude; the worst surviving image is about <b>${Math.round(leakRatio * 100)}%</b> of the tone. A longer filter (more taps) gets closer to the ideal brick-wall — but never perfectly reaches it.`}
      </Callout>

      <Panel title="Listen to the result">
        <div className={styles.audioRow}>
          <button
            className={`${styles.playBtn} ${playingId === "zeros" ? styles.playing : ""}`}
            onClick={() => playStage("zeros")}
          >
            ▶ Zero-stuffed (before filter)
          </button>
          <button
            className={`${styles.playBtn} ${playingId === "yours" ? styles.playing : ""}`}
            onClick={() => playStage("yours")}
          >
            ▶ Filtered — your cutoff
          </button>
          <button
            className={`${styles.playBtn} ${styles.goodBtn} ${playingId === "correct" ? styles.playing : ""}`}
            onClick={() => playStage("correct")}
          >
            ▶ Filtered — correct cutoff (π/L)
          </button>
        </div>
        <p className={styles.audioNote}>
          Try a cutoff that is too high (images leak — buzz mixed into the tone) or too
          low (the tone itself gets muffled), then compare with the correct-cutoff button.
        </p>
      </Panel>

      <div className={styles.tryThis}>
        <div className={styles.tryKicker}>Student challenges</div>
        <p>Use the shortcuts, then listen. The plots update with the same FIR as the audio.</p>
        <div className={styles.quizRow}>
          <button className={styles.quizBtn} onClick={() => setCutoff(Math.round(fsNew * 0.42))}>
            Leak images (cutoff too high)
          </button>
          <button className={styles.quizBtn} onClick={() => setCutoff(Math.max(10, Math.round(correctCutoff * 0.35)))}>
            Muffle the tone (cutoff too low)
          </button>
          <button className={styles.quizBtn} onClick={() => setCutoff(correctCutoff)}>
            Restore π/L
          </button>
        </div>
      </div>

      <div className={styles.learnBox}>
        <h4>Six words from the lecture summary</h4>
        <ul>
          <li>
            <b>Going faster:</b> stuff zeros, THEN filter — with gain L.
          </li>
          <li>Order is the mirror of decimation (there you filter first, then downsample).</li>
          <li>A real filter is never a perfect wall — length and cutoff choice both matter.</li>
        </ul>
      </div>
    </div>
  );
}
