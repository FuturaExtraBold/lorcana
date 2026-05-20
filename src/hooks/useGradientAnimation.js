import { useEffect, useRef } from "react";

const hexToRgb = (hex) => ({
  r: (hex >> 16) & 0xff,
  g: (hex >> 8) & 0xff,
  b: hex & 0xff,
});

const rgbToHex = (r, g, b) =>
  (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);

export function useGradientAnimation(elementRef, activeColor, baseColors) {
  const frameRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const targetTopColor = activeColor ?? baseColors[0];
    let targetBottomColor;

    if (activeColor) {
      const { r, g, b } = hexToRgb(activeColor);
      targetBottomColor = rgbToHex(r * 0.5, g * 0.5, b * 0.5);
    } else {
      targetBottomColor = baseColors[1];
    }

    const { r: r0, g: g0, b: b0 } = hexToRgb(baseColors[0]);
    const { r: r1, g: g1, b: b1 } = hexToRgb(baseColors[1]);
    const { r: tr, g: tg, b: tb } = hexToRgb(targetTopColor);
    const { r: br, g: bg, b: bb } = hexToRgb(targetBottomColor);

    const computedStyle = window.getComputedStyle(element);
    const parseChannel = (name, fallback) => {
      const value = Number.parseFloat(computedStyle.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };
    const startState = {
      r0: parseChannel("--bg-r0", r0),
      g0: parseChannel("--bg-g0", g0),
      b0: parseChannel("--bg-b0", b0),
      r1: parseChannel("--bg-r1", r1),
      g1: parseChannel("--bg-g1", g1),
      b1: parseChannel("--bg-b1", b1),
      angle: parseChannel("--bg-angle", activeColor ? 0 : 180),
    };
    const endState = {
      r0: tr,
      g0: tg,
      b0: tb,
      r1: br,
      g1: bg,
      b1: bb,
      angle: activeColor ? 180 : 0,
    };

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    const durationMs = 1000;
    let startTime = null;

    const applyState = (progress) => {
      const mix = (start, end) => start + (end - start) * progress;
      element.style.setProperty("--bg-r0", String(Math.round(mix(startState.r0, endState.r0))));
      element.style.setProperty("--bg-g0", String(Math.round(mix(startState.g0, endState.g0))));
      element.style.setProperty("--bg-b0", String(Math.round(mix(startState.b0, endState.b0))));
      element.style.setProperty("--bg-r1", String(Math.round(mix(startState.r1, endState.r1))));
      element.style.setProperty("--bg-g1", String(Math.round(mix(startState.g1, endState.g1))));
      element.style.setProperty("--bg-b1", String(Math.round(mix(startState.b1, endState.b1))));
      element.style.setProperty("--bg-angle", String(mix(startState.angle, endState.angle)));
    };

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / durationMs);
      applyState(progress);
      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(step);
      } else {
        frameRef.current = null;
      }
    };

    applyState(0);
    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColor, baseColors]);
}
