export default function Logo({ src, alt, position = "top" }) {
  const isTop = position === "top";

  return (
    <img
      src={src}
      alt={alt}
      style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: 40,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        maxWidth: isTop ? 240 : 360,
        width: "20%",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
}
