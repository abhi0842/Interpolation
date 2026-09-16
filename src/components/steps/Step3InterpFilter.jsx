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
          <div className={styles.stepDesc}>
            A real Hamming-windowed sinc is designed and convolved in the next step.
            Drag the cutoff away from π/L to see images leak or the tone get muffled.
          </div>
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
          π/L · gain L
        </div>
        <div className={styles.pipeArrow}>→</div>
        <div className={`${styles.pipeBlock} ${styles.active}`}>
          <div className={styles.pipeLabel}>Output</div>
          y[n]
        </div>
      </div>

      <Panel>
        <Slider
          id="in-L4"
          label="L (live)"
          value={L}
          min={2}
          max={6}
          step={1}
          onChange={setL}
          formatter={(v) => String(v)}
        />
        <div className={styles.readoutGrid}>
          <Readout label="L" value={String(L)} color="blue" />
          <Readout label="New rate" value={fmtHz(fsNew)} color="green" />
          <Readout label="Cutoff π/L" value={fmtHz(correctCutoff)} color="amber" />
          <Readout label="Filter gain" value={"×" + L} color="amber" />
        </div>
      </Panel>

      <Formula title="Lecture recipe (mirror of decimation)">
        {`Keep every original sample, insert <b>L−1 zeros</b>, then low-pass with cutoff <b>π/L</b> (that is f<sub>s</sub>/2 at the new rate) and passband gain <b>L</b> so the tone amplitude comes back. Decimation filters <i>first</i>; interpolation filters <i>after</i> ↑L.`}
      </Formula>

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
              subLabel="Odd length keeps linear phase. More taps → sharper cutoff, closer to a brick wall."
            />
            <div className={styles.readoutGrid}>
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
