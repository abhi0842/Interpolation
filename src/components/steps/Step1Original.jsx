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
          <div className={styles.stepDesc}>
            Interpolation starts from a slow sequence. Build a single tone, look at the
            stems, and listen at rate f<sub>s</sub>. Hover a stem to read x[n].
          </div>
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
              subLabel="Keep this small so you can count every sample — the lecture used 12."
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

      {signalGenerated && (
        <div className={styles.tryThis}>
          <div className={styles.tryKicker}>Check your understanding</div>
          <p>
            If you play these samples faster by only inserting zeros (no filter), will
            you hear a clean sine, or extra buzz?
          </p>
          <div className={styles.quizRow}>
            <button
              className={`${styles.quizBtn} ${quizAnswer === "clean" ? styles.quizWrong : ""}`}
              onClick={() => setQuizAnswer("clean")}
            >
              Clean sine — zeros do nothing
            </button>
            <button
              className={`${styles.quizBtn} ${quizAnswer === "buzz" ? styles.quizRight : ""}`}
              onClick={() => setQuizAnswer("buzz")}
            >
              Buzz — images appear in the spectrum
            </button>
          </div>
          {quizAnswer === "buzz" && (
            <Callout type="safe" title="Correct">
              Zero-stuffing stretches the sequence and <b>squeezes</b> the spectrum.
              Copies (images) appear between the old Nyquist and the new one. Step 2
              shows this, then Step 3 designs the LPF that removes them.
            </Callout>
          )}
          {quizAnswer === "clean" && (
            <Callout type="info" title="Not quite">
              Inserted zeros are real samples at the new rate. A DAC holds them, which
              sounds buzzy. You still need a low-pass filter with cutoff π/L and gain L.
            </Callout>
          )}
        </div>
      )}
    </div>
  );
}
