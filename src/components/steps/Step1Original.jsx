import { useContext } from "react";
import { InterpolationContext } from "../../context/InterpolationContext";
import Slider from "../ui/Slider";
import Panel from "../ui/Panel";
import Readout from "../ui/Readout";
import Callout from "../ui/Callout";
import StemPlot from "../visualizations/StemPlot";
import InterpSpectrum from "../visualizations/InterpSpectrum";
import SampleStrip from "../visualizations/SampleStrip";
import styles from "./Steps.module.css";

export default function Step1Original() {
  const {
    fs,
    setFs,
    fTone,
    setFTone,
    nShow,
    setNShow,
    x,
    signalGenerated,
    generateSignal,
    playStage,
    playingId,
    quizAnswer,
    setQuizAnswer,
    fmtHz,
  } = useContext(InterpolationContext);

  const nyq = fs / 2;
  const safe = fTone < nyq;

  return (
    <div className={styles.stepWrap}>
      <div className={styles.stepHead}>
        <div className={styles.stepNum}>1</div>
        <div>
          <div className={styles.stepTitle}>Original signal — discrete samples x[n]</div>
          
        </div>
      </div>

      <div className={styles.grid2}>
        <div>
          <Panel title="Original rate &amp; signal">
            <Slider
               id="in-fs"
              label="f<sub>s</sub>"
              value={fs}
              min={200}
              max={800}
              step={20}
              onChange={setFs}
              formatter={(v) => v + " Hz"}
            />
            <Slider
              id="in-fa"
              label="Tone frequency"
              value={fTone}
              min={5}
              max={120}
              step={5}
              onChange={setFTone}
              formatter={(v) => v + " Hz"}
            />
            <Slider
              id="in-nshow"
              label="Samples shown"
              value={nShow}
              min={6}
              max={16}
              step={1}
              onChange={setNShow}
              formatter={(v) => v}
            />
            <div className={styles.readoutGrid}>
              <Readout label="Nyquist fs/2" value={fmtHz(nyq)} color="blue" />
              <Readout
                label="Samples / cycle"
                value={(fs / fTone).toFixed(1)}
                color="green"
              />
            </div>
            <div className={styles.generateRow}>
              <button className={styles.generateButton} onClick={generateSignal}>
                {signalGenerated ? "Regenerate signal" : "Generate signal"}
              </button>
            </div>
          </Panel>
          {signalGenerated && (
            <Panel title="Sample values x[n]">
              <SampleStrip samples={x} mode="orig" />
            </Panel>
          )}
        </div>

        {signalGenerated && (
          <div>
            <Panel title="(a) Time — original samples only">
              <StemPlot
                samples={x}
                label={`${nShow} samples @ ${fs} Hz`}
                height={170}
              />
              <div className={styles.audioRow}>
                <button
                  className={`${styles.playBtn} ${playingId === "orig" ? styles.playing : ""}`}
                  onClick={() => playStage("orig")}
                >
                  ▶ Play original (rate f<sub>s</sub>)
                </button>
              </div>
            </Panel>
            <Panel title="Spectrum of original (0 → fs/2)">
              <InterpSpectrum
                peaks={[{ f: fTone, a: 1, color: "#2563eb", label: "tone" }]}
                maxFreq={nyq}
                height={140}
              />
            </Panel>
            <Callout
              type={safe ? "safe" : "danger"}
              title={safe ? "This tone is representable" : "Tone is above Nyquist"}
            >
              {safe
                ? `f = ${fmtHz(fTone)} sits below fs/2 = ${fmtHz(nyq)}. Next you will insert zeros to run the same sequence at a higher rate — without changing these values.`
                : `Lower the tone or raise fs so the original samples are valid before upsampling.`}
            </Callout>
          </div>
        )}
      </div>

      
    </div>
  );
}
