// Pre-calculated ink colors with their darkened variants
const INK_COLORS_BASE = [
  0xf5b202, // Gold
  0x81377b, // Purple
  0x2a8934, // Green
  0xd3082f, // Red
  0x0189c4, // Blue
  0x9fa8b4, // Gray
];

const hexToRgb = (hex) => ({
  r: (hex >> 16) & 0xff,
  g: (hex >> 8) & 0xff,
  b: hex & 0xff,
});

const rgbToHex = (r, g, b) =>
  (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);

export const INK_COLORS = INK_COLORS_BASE.map(color => {
  const { r, g, b } = hexToRgb(color);
  const darkColor = rgbToHex(r * 0.5, g * 0.5, b * 0.5);
  return { light: color, dark: darkColor };
});

export const INK_COLORS_ARRAY = INK_COLORS_BASE;
