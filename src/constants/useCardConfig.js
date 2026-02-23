// Card configuration and magic numbers
export const CARD_CONFIG = {
  width: 3.6,
  height: 5.0,
  backUrl: "/cardback.jpg",
  baseScale: 1.0,
  activeScale: 1.5,
  openScale: 2.6,
  maxTilt: Math.PI / 36,
  pivotOffsetY: 5.0 * 0.4,
  // Animation speeds
  openSpeedClosed: 12,
  openSpeedOpen: 6,
  spinSpeedFactor: 1.5,
  // Easing
  scaleEaseFactor: 0.125,
  opacityEaseFactor: 0.2,
  zEaseFactor: 0.125,
  zActiveOffset: 0.35,
  // Interaction
  tiltSensitivity: 0.05,
  pointerTiltFactor: 0.18,
  // Thresholds
  openingThreshold: 0.001,
};
