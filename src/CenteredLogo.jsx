export default function CenteredLogo({
  src,
  alt,
  position = "top",
  width = "20%",
  maxWidth = 240,
}) {
  const positionStyle = position === "top" ? { top: 40 } : { bottom: 40 };

  return (
    <img
      src={src}
      alt={alt}
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        width,
        maxWidth,
        userSelect: "none",
        ...positionStyle,
      }}
    />
  );
}
