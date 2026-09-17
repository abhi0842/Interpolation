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
         
        </div>
      </div>

      <div className={styles.threeCol}>
        <Panel title="(a) Original">
          <StemPlot samples={x} label="" height={130} />
          
        </Panel>
        <Panel title="(b) Zero-stuffed">
          
          <StemPlot samples={z} markZeros L={L} label="" height={130} />
         <br></br><button
            className={`${styles.playBtn} ${playingId === "zeros" ? styles.playing : ""}`}
            onClick={() => playStage("zeros")}
          >
            ▶ Zero-stuffed (before filter)
          </button>
        </Panel>
        <Panel title="(c) Actually filtered">
  <StemPlot samples={y} filtered smoothGuide label="" height={130} />

  <br />

  <div className={styles.buttonRow}>
    <button
      className={`${styles.playBtn} ${
        playingId === "yours" ? styles.playing : ""
      }`}
      onClick={() => playStage("yours")}
    >
      ▶  Your cutoff
    </button>

    <button
      className={`${styles.playBtn} ${styles.goodBtn} ${
        playingId === "correct" ? styles.playing : ""
      }`}
      onClick={() => playStage("correct")}
    >
      ▶ Expected
    </button>
  </div>
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

      

      
      
    </div>
  );
}
