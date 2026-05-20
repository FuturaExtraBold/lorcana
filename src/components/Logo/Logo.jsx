import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Logo({ src, alt, position = "top", isLoaded = false }) {
  const imgRef = useRef();
  const isTop = position === "top";

  useEffect(() => {
    if (!imgRef.current) return;

    if (isLoaded) {
      gsap.to(imgRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    } else {
      imgRef.current.style.opacity = "0";
      imgRef.current.style.transform = `translateX(-50%) translateY(${isTop ? 40 : -40}px)`;
    }
  }, [isLoaded, isTop]);

  return (
    <img
      ref={imgRef}
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
      }}
    />
  );
}
