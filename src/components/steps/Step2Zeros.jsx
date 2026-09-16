import { useContext, useState, useCallback } from "react";
import { InterpolationContext } from "../../context/InterpolationContext";
import Slider from "../ui/Slider";
import Panel from "../ui/Panel";
import Readout from "../ui/Readout";
import Callout from "../ui/Callout";
import StemPlot from "../visualizations/StemPlot";
import InterpSpectrum from "../visualizations/InterpSpectrum";
import SampleStrip from "../visualizations/SampleStrip";
import styles from "./Steps.module.css";

export default function Step2Zeros() {
  const {
    L,
    setL,
    fs,
    fsNew,
    x,
    z,
    imgs,
    zones,
    fTone,
    zerosInserted,
    insertZeros,
    stuffProgress,
    setStuffProgress,
    playStage,
    playingId,
    fmtHz,
  } = useContext(InterpolationContext);

  const [animOn, setAnimOn] = useState(false);

  const runInsert = useCallback(() => {
    setAnimOn(true);
    setStuffProgress(0);
    const start = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      setStuffProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        setAnimOn(false);
        insertZeros();
      }
    };
    requestAnimationFrame(tick);
  }, [insertZeros, setStuffProgress]);

  const nImg = imgs.filter((p) => p.isImage).length;
  const reveal = zerosInserted || animOn ? Math.max(1 / z.length, stuffProgress) : x.length / z.length;

  return (
    <div className={styles.stepWrap}>
      <div className={styles.stepHead}>
        <div className={styles.stepNum}>2</div>
        <div>
          <div className={styles.stepTitle}>Zero-stuffed — then images in frequency</div>
          <div className={styles.stepDesc}>
            Choose L, then insert L−1 zeros after every original sample. Time gets
            longer; the spectrum is squeezed and L−1 image copies appear.
          </div>
        </div>
      </div>

      <Panel>
        <Slider
          id="in-L2"
          label="Upsampling factor L"
          value={L}
          min={2}
          max={6}
          step={1}
          onChange={setL}
          formatter={(v) => "L = " + v}
        />
        <div className={styles.readoutGrid}>
          <Readout label="L" value={String(L)} color="blue" />
          <Readout label="Zeros after each sample" value={String(L - 1)} color="red" />
          <Readout label="Length multiplier" value={"×" + L} color="green" />
          <Readout label="New rate" value={fmtHz(fsNew)} color="amber" />
        </div>
        <div className={styles.animPanel}>
          <button className={`${styles.animBtn} ${styles.primary}`} onClick={runInsert} disabled={animOn}>
            {zerosInserted ? "Replay zero insertion" : "Insert zeros"}
          </button>
          <span className={styles.animStatus}>
            {animOn
              ? `inserting… ${Math.round(stuffProgress * 100)}%`
              : zerosInserted
                ? `${z.length} samples @ ${fmtHz(fsNew)}`
                : "Press to watch zeros appear between the blue samples"}
          </span>
        </div>
      </Panel>

      <div className={styles.sideBySide}>
        <Panel title="(b) Time — original (blue) + inserted zeros (red)">
          <StemPlot
            samples={zerosInserted || animOn ? z : x}
            markZeros={zerosInserted || animOn}
            L={L}
            reveal={zerosInserted || animOn ? reveal : 1}
            label={
              zerosInserted || animOn
                ? `L=${L} · ${z.length} samples @ ${fsNew} Hz`
                : `original · ${x.length} samples`
            }
            height={170}
          />
          <div className={styles.legend}>
            <span>
              <i style={{ background: "#2563eb" }} />
              Original sample
            </span>
            <span>
              <i style={{ background: "#dc2626" }} />
              Inserted zero
            </span>
          </div>
        </Panel>
        <Panel title="The stretched sample sequence">
          <SampleStrip samples={zerosInserted || animOn ? z : x} mode={zerosInserted || animOn ? "zeros" : "orig"} L={L} />
          <p className={styles.audioNote}>
            Play at the new rate f<sub>s</sub>·L. The DAC holds each zero, so you hear
            a buzzy version of the tone — those are the spectral images.
          </p>
          <div className={styles.audioRow}>
            <button
              className={`${styles.playBtn} ${playingId === "zeros" ? styles.playing : ""}`}
              onClick={() => playStage("zeros")}
              disabled={!zerosInserted && !animOn}
            >
              ▶ Play zero-stuffed (rate f<sub>s</sub>·L, buzzy)
            </button>
          </div>
        </Panel>
      </div>

      {(zerosInserted || animOn) && (
        <>
          <div className={styles.stepHead} style={{ marginTop: 20 }}>
            <div className={styles.stepNum}>2b</div>
            <div>
              <div className={styles.stepTitle}>In frequency: spectrum is squeezed — images appear</div>
              <div className={styles.stepDesc}>
                Same L. Hover the purple peaks — they are copies of the tone, not new
                information. The interpolation filter must keep only the blue baseband.
              </div>
            </div>
          </div>
          <div className={styles.sideBySide}>
            <Panel title="Before ↑L — original spectrum">
              <InterpSpectrum
                peaks={[{ f: fTone, a: 1, color: "#2563eb", label: "tone" }]}
                maxFreq={fs / 2}
                height={160}
              />
            </Panel>
            <Panel title="After ↑L only — squeezed + images">
              <InterpSpectrum
                peaks={imgs}
                maxFreq={fsNew / 2}
                basebandTo={fs / 2}
                imageZones={zones}
                height={160}
                legend={[
                  { color: "#2563eb", label: "Baseband (squeezed)" },
                  { color: "#7c3aed", label: "Images (L−1 copies)" },
                ]}
              />
            </Panel>
          </div>
          <Callout type="purple" title={`L = ${L}`}>
            {`Spectrum squeezed into 0…${fmtHz(fs / 2)}. <b>${L - 1}</b> image region(s) appear (purple). You see about <b>${nImg}</b> image peak(s). These are removable — next step designs and applies a real FIR low-pass filter with cutoff π/L and gain L.`}
          </Callout>
        </>
      )}
    </div>
  );
}
