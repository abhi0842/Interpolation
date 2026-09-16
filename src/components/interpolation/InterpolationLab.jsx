import { useContext } from "react";
import { InterpolationContext } from "../../context/InterpolationContext";
import Step1Original from "../steps/Step1Original";
import Step2Zeros from "../steps/Step2Zeros";
import Step3InterpFilter from "../steps/Step3InterpFilter";
import Step4Output from "../steps/Step4Output";
import GuidedModal from "../guide/GuidedModal";
import styles from "./interpolation.module.css";

const steps = [
  { id: 0, label: "1. Original" },
  { id: 1, label: "2. Zeros & images" },
  { id: 2, label: "3. Filter" },
  { id: 3, label: "4. Output & diffs" },
];

const learningSteps = [
  {
    title: "Start with x[n]",
    detail: "Understand the original samples before changing the rate.",
    result: "A valid tone below fs/2",
  },
  {
    title: "Insert zeros: ↑L",
    detail: "Create room for L times as many samples, without inventing information.",
    result: "Images appear in the spectrum",
  },
  {
    title: "Remove images: LPF",
    detail: "Keep the baseband, reject the copies, and use gain L to restore amplitude.",
    result: "A clean high-rate sequence",
  },
  {
    title: "Compare y[n]",
    detail: "Connect the time plot, spectrum, and what you hear.",
    result: "Buzz = leakage; dull = too much filtering",
  },
];

export default function InterpolationLab() {
  const {
    activeStep,
    setActiveStep,
    prevStep,
    nextStep,
    resetLab,
    canAdvance,
  } = useContext(InterpolationContext);

  return (
    <div className={styles.wrap}>
      <div className={styles.tabbar}>
        {steps.map((s) => (
          <button
            key={s.id}
            className={activeStep === s.id ? styles.active : ""}
            onClick={() => setActiveStep(s.id)}
            disabled={s.id > activeStep + 1 || (s.id === activeStep + 1 && !canAdvance)}
            title={s.id > activeStep ? "Complete the current step first" : undefined}
          >
            <span className={styles.tabN}>{s.id + 1}</span>
            <span className={styles.tabLabel}>{s.label.replace(/^\d+\.\s*/, "")}</span>
          </button>
        ))}
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: ((activeStep + 1) / steps.length) * 100 + "%" }}
        />
        {steps.map((s) => (
          <div
            key={s.id}
            className={`${styles.progressDot} ${activeStep >= s.id ? styles.dotDone : ""}`}
            style={{ left: (s.id / (steps.length - 1)) * 100 + "%" }}
          />
        ))}
      </div>

      <section className={styles.learningRail} aria-label="Interpolation mental model">
        <div className={styles.learningIntro}>
          <span className={styles.learningKicker}>Mental model</span>
          <strong>Go faster in three moves</strong>
          <span>↑L first, LPF second, then listen for the evidence.</span>
        </div>
        <div className={styles.learningSteps}>
          {learningSteps.map((item, index) => (
            <div
              className={`${styles.learningStep} ${activeStep === index ? styles.learningCurrent : ""}`}
              key={item.title}
            >
              <span className={styles.learningNumber}>{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                {activeStep === index && <small>Look for: {item.result}</small>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeStep === 0 && <Step1Original />}
      {activeStep === 1 && <Step2Zeros />}
      {activeStep === 2 && <Step3InterpFilter />}
      {activeStep === 3 && <Step4Output />}

      <div className={styles.tabfoot}>
        <button className={styles.navbtn} onClick={prevStep} disabled={activeStep === 0}>
          ← Previous
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.navbtn} onClick={resetLab} title="Reset to lecture defaults">
            Reset
          </button>
          <button
            className={`${styles.navbtn} ${styles.next}`}
            onClick={nextStep}
            disabled={activeStep === steps.length - 1 || !canAdvance}
            title={!canAdvance ? "Complete the current step first" : undefined}
          >
            {activeStep === steps.length - 1 ? "Done ✓" : "Next →"}
          </button>
        </div>
      </div>

      <GuidedModal />

      <footer className={styles.footer}>
        Virtual Lab · Multirate DSP · Correct chain:
        <b> upsample (insert zeros) → LPF with cutoff π/L and gain L</b>
      </footer>
    </div>
  );
}
