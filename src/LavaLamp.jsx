import { useEffect, useRef } from "react";

import * as THREE from "three";

import { createLavaLampMaterial } from "./lavaLampMaterial";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const hexToVec3 = (hex) => {
  return new THREE.Vector3(
    ((hex >> 16) & 0xff) / 255,
    ((hex >> 8) & 0xff) / 255,
    (hex & 0xff) / 255,
  );
};

export default function LavaLampBackground({
  colors = [0x4d366c, 0x050402, 0x4d366c, 0x050402],
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(0.85);
    const mountElement = mountRef.current;
    if (!mountElement) return;
    mountElement.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0.0 },
      iResolution: {
        value: new THREE.Vector3(CANVAS_WIDTH, CANVAS_HEIGHT, 1),
      },
      uColor0: { value: hexToVec3(colors[0]) },
      uColor1: { value: hexToVec3(colors[1]) },
      uColor2: { value: hexToVec3(colors[2]) },
      uColor3: { value: hexToVec3(colors[3]) },
      uSpeed: { value: 0.04 },
    };

    const material = createLavaLampMaterial(uniforms);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let resizeRaf = 0;

    renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT, false);
    uniforms.iResolution.value.set(CANVAS_WIDTH, CANVAS_HEIGHT, 1);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.left = "50%";
    renderer.domElement.style.top = "50%";
    renderer.domElement.style.transform = "translate(-50%, -50%)";

    const resize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (!width || !height) return;
        const scale = Math.max(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
        const drawWidth = Math.ceil(CANVAS_WIDTH * scale);
        const drawHeight = Math.ceil(CANVAS_HEIGHT * scale);
        renderer.domElement.style.width = `${drawWidth}px`;
        renderer.domElement.style.height = `${drawHeight}px`;
      });
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();
    let animationId = null;
    let lastFrameTime = 0;

    const animate = () => {
      const currentTime = performance.now();
      if (currentTime - lastFrameTime < 33) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      const elapsedTime = (currentTime - startTime) * 0.001;

      uniforms.iTime.value = elapsedTime;
      renderer.render(scene, camera);
      lastFrameTime = currentTime;
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("resize", resize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      renderer.dispose();
      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  );
}
