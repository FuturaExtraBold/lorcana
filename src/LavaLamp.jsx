import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createLavaLampMaterial } from "./lavaLampMaterial";

const hexToVec3 = (hex) => {
  return new THREE.Vector3(
    ((hex >> 16) & 0xff) / 255,
    ((hex >> 8) & 0xff) / 255,
    (hex & 0xff) / 255,
  );
};

export default function LavaLampBackground({
  colors = [0x111111, 0x444444],
  activeColor,
  transitionSeconds = 1,
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(0.7);

    const mountElement = mountRef.current;
    if (!mountElement) return;
    mountElement.appendChild(renderer.domElement);

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      if (uniformsRef.current) {
        uniformsRef.current.iResolution.value.set(width, height, 1);
      }
    };

    const uniforms = {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector3(0, 0, 1) },
      uColor0: { value: hexToVec3(colors[0]) },
      uColor1: { value: hexToVec3(colors[1]) },
      uSpeed: { value: 0.02 },
    };
    uniformsRef.current = uniforms;

    const material = createLavaLampMaterial(uniforms);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    updateSize();

    const handleResize = () => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateSize, 100);
    };
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();
    let animationId = null;
    let lastFrameTime = 0;
    const FRAME_TIME = 1000 / 20; // 20 FPS

    const animate = () => {
      const currentTime = performance.now();
      if (currentTime - lastFrameTime >= FRAME_TIME) {
        const elapsedTime = (currentTime - startTime) * 0.001;
        uniforms.iTime.value = elapsedTime;
        renderer.render(scene, camera);
        lastFrameTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeoutRef.current);
      renderer.dispose();
      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    gsap.to(uniforms.uColor0.value, {
      x: hexToVec3(colors[0]).x,
      y: hexToVec3(colors[0]).y,
      z: hexToVec3(colors[0]).z,
      duration: transitionSeconds,
    });

    gsap.to(uniforms.uColor1.value, {
      x: hexToVec3(activeColor ?? colors[1]).x,
      y: hexToVec3(activeColor ?? colors[1]).y,
      z: hexToVec3(activeColor ?? colors[1]).z,
      duration: transitionSeconds,
    });
  }, [activeColor, colors, transitionSeconds]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
