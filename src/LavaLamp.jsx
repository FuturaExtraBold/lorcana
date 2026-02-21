import { useEffect, useRef } from "react";

import gsap from "gsap";
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
  colors = [0x111111, 0x444444],
  activeColor,
  transitionSeconds = 1,
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef(null);

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
      uSpeed: { value: 0.04 },
    };
    uniformsRef.current = uniforms;

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
    const TARGET_FPS = 30;
    const FRAME_TIME = 1000 / TARGET_FPS;

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
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("resize", resize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      renderer.dispose();
      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    const target0 = hexToVec3(colors[0]);
    const target1 = hexToVec3(activeColor ?? colors[1]);

    gsap.to(uniforms.uColor0.value, {
      x: target0.x,
      y: target0.y,
      z: target0.z,
      duration: transitionSeconds,
      overwrite: true,
    });
    gsap.to(uniforms.uColor1.value, {
      x: target1.x,
      y: target1.y,
      z: target1.z,
      duration: transitionSeconds,
      overwrite: true,
    });
  }, [activeColor, colors, transitionSeconds]);

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
