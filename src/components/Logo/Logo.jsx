export default function Logo({ src, alt, position = "top", isLoaded = false }) {
  const isTop = position === "top";

  return (
    <img
      src={src}
      alt={alt}
      style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: 40,
        left: "50%",
        zIndex: 20,
        maxWidth: isTop ? 240 : 360,
        width: "20%",
        userSelect: "none",
        pointerEvents: "none",
        opacity: isLoaded ? 1 : 0,
        transform: `translateX(-50%) translateY(${isLoaded ? 0 : isTop ? 40 : -40}px)`,
        transition: "opacity 800ms ease, transform 800ms ease",
        willChange: "opacity, transform",
      }}
    />
  );
}
