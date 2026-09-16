export function fmtHz(v) {
  return Math.round(v) + " Hz";
}

export function origSamples(fs, fTone, aTone, nShow) {
  const x = [];
  for (let n = 0; n < nShow; n++) {
    x.push(aTone * Math.sin((2 * Math.PI * fTone * n) / fs));
  }
  return x;
}

export function zeroStuff(x, L) {
  const y = [];
  for (let i = 0; i < x.length; i++) {
    y.push(x[i]);
    for (let z = 0; z < L - 1; z++) y.push(0);
  }
  return y;
}

export function designInterpFIR(cutoffHz, fsNew, numTaps, gain) {
  const fcFrac = Math.max(0.001, Math.min(0.499, cutoffHz / fsNew));
  const M = numTaps - 1;
  const taps = [];
  for (let n = 0; n <= M; n++) {
    const k = n - M / 2;
    const h =
      k === 0 ? 2 * fcFrac : Math.sin(2 * Math.PI * fcFrac * k) / (Math.PI * k);
    const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / M);
    taps.push(h * w * gain);
  }
  return taps;
}

export function magAtFreq(taps, fsNew, f) {
  const w = (2 * Math.PI * f) / fsNew;
  let re = 0;
  let im = 0;
  for (let n = 0; n < taps.length; n++) {
    re += taps[n] * Math.cos(w * n);
    im -= taps[n] * Math.sin(w * n);
  }
  return Math.sqrt(re * re + im * im);
}

export function freqResponse(taps, fsNew, points = 130) {
  const out = [];
  for (let i = 0; i <= points; i++) {
    const f = (fsNew / 2) * (i / points);
    out.push({ f, mag: magAtFreq(taps, fsNew, f) });
  }
  return out;
}

export function convolve(x, h) {
  const y = new Array(x.length + h.length - 1).fill(0);
  for (let n = 0; n < x.length; n++) {
    if (x[n] === 0) continue;
    for (let k = 0; k < h.length; k++) y[n + k] += x[n] * h[k];
  }
  return y;
}

export function filteredSamplesReal(z, taps) {
  const full = convolve(z, taps);
  const delay = Math.floor((taps.length - 1) / 2);
  return full.slice(delay, delay + z.length);
}

export function imagePeaks(fs, L, fTone, aTone) {
  const fsNew = fs * L;
  const peaks = [];
  peaks.push({
    f: fTone,
    a: aTone / L,
    color: "#2563eb",
    label: "tone",
    isImage: false,
  });
  for (let k = 1; k < L; k++) {
    [k * fs - fTone, k * fs + fTone].forEach((fi) => {
      let f = Math.abs(fi);
      if (f > fsNew) f = f % fsNew;
      if (f > fsNew / 2) f = fsNew - f;
      if (f > 2 && f < fsNew / 2 - 2) {
        peaks.push({
          f,
          a: aTone / L,
          color: "#7c3aed",
          label: "image",
          isImage: true,
        });
      }
    });
  }
  peaks.sort((a, b) => a.f - b.f);
  const out = [];
  peaks.forEach((p) => {
    if (!out.length || Math.abs(out[out.length - 1].f - p.f) > 3) out.push(p);
  });
  return out;
}

export function imageZones(fs, L) {
  const fsNew = fs * L;
  const bb = fs / 2;
  const zones = [];
  for (let k = 1; k < L; k++) {
    const lo = Math.max(bb, k * fs - fs / 2);
    const hi = Math.min(fsNew / 2, k * fs + fs / 2);
    if (hi > lo + 2) zones.push([lo, hi]);
  }
  return zones;
}

export function audioSequences({ fs, fTone, aTone, L, durationSec }) {
  const fsNew = fs * L;
  const nSamples = Math.max(1, Math.ceil(fs * durationSec));
  const x = [];
  for (let n = 0; n < nSamples; n++) {
    x.push(aTone * Math.sin((2 * Math.PI * fTone * n) / fs));
  }
  const z = zeroStuff(x, L);
  return { x, z, fs, fsNew };
}

export function playZOH(ctx, values, rateHz, durationSec) {
  if (!values.length) return null;
  const audioRate = ctx.sampleRate;
  const totalSamples = Math.floor(audioRate * durationSec);
  const buffer = ctx.createBuffer(1, totalSamples, audioRate);
  const data = buffer.getChannelData(0);
  const samplesPerHold = Math.max(1, audioRate / rateHz);
  for (let i = 0; i < totalSamples; i++) {
    const idx = Math.min(values.length - 1, Math.floor(i / samplesPerHold));
    data[i] = values[idx] * 0.3;
  }
  const fadeSamples = Math.min(600, Math.floor(totalSamples / 4));
  for (let i = 0; i < fadeSamples; i++) {
    const g = i / fadeSamples;
    data[i] *= g;
    data[totalSamples - 1 - i] *= g;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  src.start();
  return src;
}

export const AUDIO_DUR = 1.4;
