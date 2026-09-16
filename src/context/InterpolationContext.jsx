/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { guideSteps } from "../data/guideSteps";
import {
  AUDIO_DUR,
  audioSequences,
  designInterpFIR,
  filteredSamplesReal,
  freqResponse,
  fmtHz,
  imagePeaks,
  imageZones,
  magAtFreq,
  origSamples,
  playZOH,
  zeroStuff,
} from "../utils/interpolation";

export const InterpolationContext = createContext();

const stepRequirements = ["EXPLORE_SIGNAL", "SET_L", "SET_LPF", "SEE_OUT"];

export const InterpolationProvider = ({ children }) => {
  const [fs, setFs] = useState(400);
  const [fTone, setFTone] = useState(40);
  const [aTone] = useState(1.0);
  const [nShow, setNShow] = useState(12);
  const [L, setLRaw] = useState(3);
  const [cutoffHz, setCutoffHz] = useState(200);
  const [cutoffAuto, setCutoffAuto] = useState(true);
  const [numTaps, setNumTaps] = useState(41);
  const [signalGenerated, setSignalGenerated] = useState(false);
  const [zerosInserted, setZerosInserted] = useState(false);
  const [stuffProgress, setStuffProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [playingId, setPlayingId] = useState(null);

  const [guideActive, setGuideActive] = useState(false);
  const [guideStepIdx, setGuideStepIdx] = useState(0);
  const [actions, setActions] = useState({});
  const [showInstruction, setShowInstruction] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);

  const buttonRef = useRef(null);
  const instructionPanelRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioSrcRef = useRef(null);

  const steps = guideSteps;
  const currentGuideStep = steps[guideStepIdx];
  const canProceed =
    !currentGuideStep?.requiredAction || !!actions[currentGuideStep.requiredAction];

  const markAction = useCallback(
    (action) => {
      setActions((prev) => {
        const next = { ...prev, [action]: true };
        if (
          currentGuideStep?.requiredAction === action &&
          !prev[action] &&
          guideStepIdx < steps.length - 1
        ) {
          setTimeout(() => {
            setGuideStepIdx((s) => Math.min(steps.length - 1, s + 1));
          }, 400);
        }
        return next;
      });
    },
    [currentGuideStep, guideStepIdx, steps]
  );

  const isStepComplete = useCallback(
    (step) => {
      if (step === 0) return signalGenerated;
      if (step === 1) return zerosInserted;
      return !!actions[stepRequirements[step]];
    },
    [actions, signalGenerated, zerosInserted]
  );

  const fsNew = fs * L;
  const correctCutoff = fs / 2;
  const cutoffUsed = cutoffAuto
    ? correctCutoff
    : Math.max(10, Math.min(fsNew / 2 - 5, cutoffHz));

  const pipeline = useMemo(() => {
    const x = origSamples(fs, fTone, aTone, nShow);
    const z = zeroStuff(x, L);
    const taps = designInterpFIR(cutoffUsed, fsNew, numTaps, L);
    const respCurve = freqResponse(taps, fsNew, 130);
    const y = filteredSamplesReal(z, taps);
    const imgs = imagePeaks(fs, L, fTone, aTone);
    const zones = imageZones(fs, L);
    const filteredPeaks = imgs.map((p) => ({
      ...p,
      a: p.a * magAtFreq(taps, fsNew, p.f),
    }));
    const toneAfter = (aTone / L) * magAtFreq(taps, fsNew, fTone);
    const imageAfters = filteredPeaks.filter((p) => p.isImage).map((p) => p.a);
    const worstImageAfter = imageAfters.length ? Math.max(...imageAfters) : 0;
    const leakRatio = toneAfter > 1e-9 ? worstImageAfter / toneAfter : 0;
    const toneRatio = aTone > 1e-9 ? toneAfter / aTone : 0;
    return {
      x,
      z,
      y,
      taps,
      respCurve,
      imgs,
      zones,
      filteredPeaks,
      leakRatio,
      toneRatio,
    };
  }, [fs, fTone, aTone, nShow, L, cutoffUsed, fsNew, numTaps]);

  const setL = (v) => {
    setLRaw(+v);
    setCutoffAuto(true);
    setZerosInserted(false);
    setStuffProgress(0);
    markAction("SET_L");
  };

  const setCutoff = (v) => {
    setCutoffAuto(false);
    setCutoffHz(+v);
    markAction("SET_LPF");
  };

  const setTaps = (v) => {
    let n = +v;
    if (n % 2 === 0) n += 1;
    setNumTaps(n);
    markAction("SET_LPF");
  };

  const resetCutoff = () => {
    setCutoffAuto(true);
    markAction("SET_LPF");
  };

  const generateSignal = useCallback(() => {
    setSignalGenerated(true);
    setZerosInserted(false);
    setStuffProgress(0);
    markAction("EXPLORE_SIGNAL");
  }, [markAction]);

  const insertZeros = useCallback(() => {
    setZerosInserted(true);
    setStuffProgress(1);
    markAction("SET_L");
  }, [markAction]);

  const goToStep = useCallback(
    (idx) => {
      const nextIndex = Math.max(0, Math.min(3, idx));
      const canMoveForward =
        nextIndex <= activeStep ||
        (nextIndex === activeStep + 1 && isStepComplete(activeStep));
      if (!canMoveForward) return;
      setActiveStep(nextIndex);
      if (nextIndex === 3) markAction("SEE_OUT");
    },
    [activeStep, isStepComplete, markAction]
  );

  const nextStep = useCallback(() => {
    if (activeStep < 3) goToStep(activeStep + 1);
  }, [activeStep, goToStep]);

  const prevStep = useCallback(() => {
    if (activeStep > 0) goToStep(activeStep - 1);
  }, [activeStep, goToStep]);

  const resetLab = useCallback(() => {
    setFs(400);
    setFTone(40);
    setNShow(12);
    setLRaw(3);
    setCutoffHz(200);
    setCutoffAuto(true);
    setNumTaps(41);
    setSignalGenerated(false);
    setZerosInserted(false);
    setStuffProgress(0);
    setActiveStep(0);
    setQuizAnswer(null);
    setActions({});
  }, []);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playStage = useCallback(
    (id) => {
      const ctx = getAudioCtx();
      if (audioSrcRef.current) {
        try {
          audioSrcRef.current.stop();
        } catch {
          /* already stopped */
        }
      }
      const seq = audioSequences({ fs, fTone, aTone, L, durationSec: AUDIO_DUR });
      let values;
      let rate;
      if (id === "orig") {
        values = seq.x;
        rate = seq.fs;
      } else if (id === "zeros") {
        values = seq.z;
        rate = seq.fsNew;
      } else if (id === "yours") {
        const taps = designInterpFIR(cutoffUsed, seq.fsNew, numTaps, L);
        values = filteredSamplesReal(seq.z, taps);
        rate = seq.fsNew;
      } else {
        const taps = designInterpFIR(correctCutoff, seq.fsNew, numTaps, L);
        values = filteredSamplesReal(seq.z, taps);
        rate = seq.fsNew;
      }
      const src = playZOH(ctx, values, rate, AUDIO_DUR);
      audioSrcRef.current = src;
      setPlayingId(id);
      if (src) {
        src.onended = () => setPlayingId(null);
      }
      markAction("HEAR");
      if (id === "yours" || id === "correct") markAction("SEE_OUT");
    },
    [fs, fTone, aTone, L, cutoffUsed, numTaps, correctCutoff, markAction]
  );

  const filterVerdict = (() => {
    const cutoffDiff = Math.abs(cutoffUsed - correctCutoff);
    if (pipeline.leakRatio > 0.12 && pipeline.toneRatio < 0.85) {
      return {
        type: "danger",
        html: "<b>Cutoff too high and the filter is too short.</b> Images leak through and the tone is also attenuated. Lower the cutoff toward π/L and try more taps.",
      };
    }
    if (pipeline.leakRatio > 0.12) {
      return {
        type: "danger",
        html: `<b>Images leaking through</b> at about ${Math.round(pipeline.leakRatio * 100)}% of the tone. Your cutoff is too high — the LPF is letting copies of the spectrum pass.`,
      };
    }
    if (pipeline.toneRatio < 0.85) {
      return {
        type: "info",
        html: `<b>Tone attenuated to ${Math.round(pipeline.toneRatio * 100)}%</b>. Cutoff is too low (or the transition is too wide). Raise it toward ${fmtHz(correctCutoff)} or add taps.`,
      };
    }
    if (cutoffDiff < fsNew * 0.02) {
      return {
        type: "safe",
        html: `<b>Nicely set.</b> Cutoff ≈ the lecture value π/L (${fmtHz(correctCutoff)}). Images are suppressed and the gain-L filter restores the tone.`,
      };
    }
    return {
      type: "neutral",
      html: `<b>Working, with some margin:</b> images are suppressed (${Math.round(pipeline.leakRatio * 100)}% leakage) and the tone is restored to ${Math.round(pipeline.toneRatio * 100)}%.`,
    };
  })();

  return (
    <InterpolationContext.Provider
      value={{
        fs,
        setFs: (v) => {
          setFs(v);
          markAction("EXPLORE_SIGNAL");
        },
        fTone,
        setFTone: (v) => {
          setFTone(v);
          markAction("EXPLORE_SIGNAL");
        },
        aTone,
        nShow,
        setNShow,
        L,
        setL,
        cutoffHz: cutoffUsed,
        cutoffAuto,
        setCutoff,
        resetCutoff,
        numTaps,
        setTaps,
        fsNew,
        correctCutoff,
        signalGenerated,
        generateSignal,
        zerosInserted,
        insertZeros,
        stuffProgress,
        setStuffProgress,
        ...pipeline,
        filterVerdict,
        fmtHz,
        quizAnswer,
        setQuizAnswer,
        playingId,
        playStage,
        activeStep,
        setActiveStep: goToStep,
        nextStep,
        prevStep,
        resetLab,
        guideActive,
        setGuideActive,
        guideStepIdx,
        setGuideStepIdx,
        actions,
        markAction,
        steps,
        currentGuideStep,
        canProceed,
        isStepComplete,
        canAdvance: isStepComplete(activeStep),
        showInstruction,
        setShowInstruction,
        buttonRef,
        instructionPanelRef,
      }}
    >
      {children}
    </InterpolationContext.Provider>
  );
};
