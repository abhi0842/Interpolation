import { useContext } from "react";
import { InterpolationContext } from "../../context/InterpolationContext";
import styles from "./layout.module.css";

const TopPanel = () => {
  const {
    showInstruction,
    setShowInstruction,
    buttonRef,
    instructionPanelRef,
    setGuideActive,
    setGuideStepIdx,
  } = useContext(InterpolationContext);

  const toggleInstruction = () => {
    setShowInstruction(!showInstruction);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.panelContainer}>
        <h1>Interpolation Lab</h1>
        <div className={styles.buttonContainer}>
          <button
            ref={buttonRef}
            className={styles.panelButton}
            onClick={toggleInstruction}
          >
            Instruction
          </button>
          <button
            id="guideButton"
            className={styles.panelButton}
            onClick={() => {
              setGuideStepIdx(0);
              setGuideActive(true);
            }}
          >
            Guided Tutor
          </button>
        </div>
      </div>
      {showInstruction && (
        <section className={styles.instructionPanel} ref={instructionPanelRef}>
          <div className={styles.instructionHeader}>
            <strong>How to run the experiment</strong>
            <button
              className={styles.instructionClose}
              onClick={() => setShowInstruction(false)}
              aria-label="Close instructions"
            >
              ×
            </button>
          </div>
          <ol>
            <li>
              Start in <b>Original</b>. Set f<sub>s</sub> and the tone, then click
              <b> Generate signal</b>. Hover stems to read x[n] and play the original.
            </li>
            <li>
              Open <b>Zeros &amp; images</b>. Choose L and press <b>Insert zeros</b>.
              Blue samples stay; red zeros fill the gaps. The spectrum squeezes and
              purple <b>images</b> appear.
            </li>
            <li>
              Open <b>Filter</b>. The lecture cutoff is π/L (numerically f<sub>s</sub>/2
              at the new rate) with gain L. Change taps and cutoff; the live verdict
              tells you if images leak or the tone is muffled.
            </li>
            <li>
              Open <b>Output</b>. Compare panels (a)(b)(c), then listen to
              zero-stuffed vs your filter vs the correct π/L filter.
            </li>
          </ol>
          <p>
            <b>What to listen for:</b> buzz means images leaked (cutoff too high). A
            dull tone means the cutoff is too low. A clean louder tone means gain L
            restored the baseband after the zeros.
          </p>
        </section>
      )}
    </div>
  );
};

export default TopPanel;
