import { useContext } from "react";
import { InterpolationContext } from "../../context/InterpolationContext";
import Slider from "../ui/Slider";
import Panel from "../ui/Panel";
import Readout from "../ui/Readout";
import Callout from "../ui/Callout";
import Formula from "../ui/Formula";
import StemPlot from "../visualizations/StemPlot";
import InterpSpectrum from "../visualizations/InterpSpectrum";
import styles from "./Steps.module.css";

export default function Step3InterpFilter() {
  const {
    L,
    setL,
    fsNew,
    cutoffHz,
    setCutoff,
    resetCutoff,
    cutoffAuto,
    numTaps,
    setTaps,
    correctCutoff,
    taps,
    respCurve,
    filterVerdict,
    fmtHz,
    markAction,
  } = useContext(InterpolationContext);

  return (
    <div className={styles.stepWrap}>
      <div className={styles.stepHead}>
        <div className={styles.stepNum}>3</div>
        <div>
          <div className={styles.stepTitle}>Design the LPF — cutoff π/L, gain L</div>
          
        </div>
      </div>

      <div className={styles.pipeline}>
        <div className={`${styles.pipeBlock} ${styles.active}`}>
          <div className={styles.pipeLabel}>Input</div>
          x[n]
        </div>
        <div className={styles.pipeArrow}>→</div>
        <div className={`${styles.pipeBlock} ${styles.active}`}>
          <div className={styles.pipeLabel}>↑ L</div>
          zeros
        </div>
        <div className={styles.pipeArrow}>→</div>
        <div className={`${styles.pipeBlock} ${styles.active}`}>
          <div className={styles.pipeLabel}>LPF</div>
          π/L · gain L= {L}
        </div>
        <div className={styles.pipeArrow}>→</div>
        <div className={`${styles.pipeBlock} ${styles.active}`}>
          <div className={styles.pipeLabel}>Output</div>
          y[n]
        </div>
      </div>


    

      <Panel title="Design the actual FIR filter">
        <div className={styles.grid2}>
          <div>
            <div className={styles.cutoffHead}>
              <Slider
                id="in-cutoff"
                label="Cutoff frequency"
                value={Math.round(cutoffHz)}
                min={10}
                max={Math.round(fsNew / 2)}
                step={5}
                onChange={setCutoff}
                formatter={(v) => Math.round(v) + " Hz"}
              />
              <button className={styles.resetLink} onClick={resetCutoff}>
                reset to π/L
              </button>
              <span className={`${styles.cutoffTag} ${cutoffAuto ? styles.ok : styles.bad}`}>
                {cutoffAuto ? "tracking π/L" : "you took control"}
              </span>
            </div>
            <Slider
              id="in-taps"
              label="Filter length (taps)"
              value={numTaps}
              min={11}
              max={121}
              step={2}
              onChange={setTaps}
              formatter={(v) => v + " taps"}
              subLabel=""
            />
            <div className={styles.readoutGrid}>
               <Readout label="New rate" value={fmtHz(fsNew)} color="green" />
              <Readout label="Your cutoff" value={fmtHz(cutoffHz)} color="blue" />
              <Readout label="Correct cutoff" value={fmtHz(correctCutoff)} color="amber" />
            </div>
            <Callout type={filterVerdict.type} title="Live verdict">
              {filterVerdict.html}
            </Callout>
            <div className={styles.generateRow}>
              <button className={styles.generateButton} onClick={() => markAction("SET_LPF")}>
                Lock in this FIR and continue
              </button>
            </div>
          </div>
          <div>
            <Panel title="Filter frequency response |H(f)|" subtitle="Green curve is the real FIR, not an ideal wall.">
              <InterpSpectrum
                peaks={[]}
                maxFreq={fsNew / 2}
                respCurve={respCurve}
                respMax={L}
                height={120}
                limitLines={[
                  { freq: correctCutoff, color: "#d97706", dash: [4, 3], label: "correct π/L" },
                  { freq: cutoffHz, color: "#2563eb", label: "your cutoff", labelY: 24 },
                ]}
              />
            </Panel>
            <Panel title="Impulse response h[n] (what actually gets convolved)">
              <StemPlot samples={taps} label={`${taps.length}-tap h[n]`} height={90} />
            </Panel>
          </div>
        </div>
      </Panel>
    </div>
  );
}
