export const guideSteps = [
  {
    title: "Welcome to the Interpolation Lab",
    description:
      "Interpolation makes a discrete signal run at a higher sample rate. The lecture order is: insert zeros (↑L), then low-pass filter with cutoff π/L and gain L. That is the mirror of decimation.",
    target: null,
  },
  {
    title: "Step 1 — Original samples",
    description:
      "Generate a short tone at rate fs. Count the stems, hover to read x[n], and play the original. These values do not change when you upsample — only zeros are inserted between them.",
    target: "step1",
    requiredAction: "EXPLORE_SIGNAL",
  },
  {
    title: "Step 2 — Zeros and images",
    description:
      "Choose L and press Insert zeros. L−1 zeros appear after every sample, the rate becomes fs·L, and the spectrum squeezes so L−1 image copies show up. Play the buzzy sequence.",
    target: "step2",
    requiredAction: "SET_L",
  },
  {
    title: "Step 3 — Design the LPF",
    description:
      "Set cutoff to π/L (that's the old Nyquist, fs/2, measured at the new rate) and keep an odd number of taps. Gain L restores amplitude. Drag the cutoff off the mark to see leakage or muffling.",
    target: "step3",
    requiredAction: "SET_LPF",
  },
  {
    title: "Step 4 — Hear the difference",
    description:
      "Compare original, zero-stuffed, and convolved output. Listen to your cutoff versus the correct π/L filter. Images that leak sound like buzz; a cutoff that is too low dulls the tone.",
    target: "step4",
    requiredAction: "SEE_OUT",
  },
  {
    title: "Keep experimenting",
    description:
      "Change L, shorten the filter, and use the Step 4 challenges. The right mental model is: going faster means zeros first, then filter — never the other way around.",
    target: null,
  },
];
