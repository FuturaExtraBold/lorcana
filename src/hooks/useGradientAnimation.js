import gsap from "gsap";
import { useEffect, useRef } from "react";

const hexToRgb = (hex) => ({
  r: (hex >> 16) & 0xff,
  g: (hex >> 8) & 0xff,
  b: hex & 0xff,
});

const rgbToHex = (r, g, b) =>
  (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);

export function useGradientAnimation(elementRef, activeColor, baseColors) {
  const animRef = useRef(null);

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

    const bgRef = { r0, g0, b0, r1, g1, b1 };
    if (animRef.current) animRef.current.kill();

    animRef.current = gsap.to(bgRef, {
      r0: tr,
      g0: tg,
      b0: tb,
      r1: br,
      g1: bg,
      b1: bb,
      duration: 1,
      onUpdate: () => {
        const angle = activeColor ? 180 : 0;
        element.style.background =
          `linear-gradient(${angle}deg, ` +
          `rgb(${Math.round(bgRef.r0)}, ${Math.round(bgRef.g0)}, ${Math.round(bgRef.b0)}) 0%, ` +
          `rgb(${Math.round(bgRef.r1)}, ${Math.round(bgRef.g1)}, ${Math.round(bgRef.b1)}) 100%)`;
      },
    });

    return () => {
      if (animRef.current) animRef.current.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColor, baseColors]);
}
