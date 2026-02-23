import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AppProvider } from "./AppContext";
import Cylinder from "./Cylinder";
import Loading from "./Loading";
import Logo from "./Logo";

function Scrim({ active, distance = 40, onClose }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera, viewport } = useThree();
  const camPosRef = useRef(new THREE.Vector3());
  const camDirRef = useRef(new THREE.Vector3());
  const targetRef = useRef(new THREE.Vector3());
  const opacityRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) {
      return;
    }
    camera.getWorldPosition(camPosRef.current);
    camera.getWorldDirection(camDirRef.current);
    targetRef.current
      .copy(camPosRef.current)
      .addScaledVector(camDirRef.current, distance - 1);
    meshRef.current.position.copy(targetRef.current);
    meshRef.current.quaternion.copy(camera.quaternion);

    const { width, height } = viewport.getCurrentViewport(
      camera,
      targetRef.current,
    );
    const planeWidth = width * 1.1;
    const planeHeight = height * 1.1;
    meshRef.current.scale.set(planeWidth, planeHeight, 1);

    const targetOpacity = active ? 0.5 : 0;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      targetOpacity,
      6,
      delta,
    );
    materialRef.current.opacity = opacityRef.current;
    meshRef.current.visible = opacityRef.current > 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      renderOrder={5}
      frustumCulled={false}
      raycast={() => null}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        color="black"
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function App() {
  const mainRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [cardsRevealed, setCardsRevealed] = useState(0);
  const openDistance = 40;
  const baseColors = [0x111111, 0x444444];
  const inkColors = [
    0xf5b202, 0x81377b, 0x2a8934, 0xd3082f, 0x0189c4, 0x9fa8b4,
  ];
  const cardData = useMemo(
    () =>
      Array.from({ length: 204 }).map((_, i) => ({
        id: i,
        thumb: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
        inkColor: inkColors[Math.floor(i / 34)],
      })),
    [],
  );
  const activeInkColor = cardData[activeId]?.inkColor ?? null;
  const cardCount = cardData.length;
  const handleCardRevealed = useCallback(() => {
    setCardsRevealed((count) => Math.min(cardCount, count + 1));
  }, [cardCount]);

  useEffect(() => {
    if (!mainRef.current) return;

    let targetTopColor, targetBottomColor;
    const gradientAngle = activeInkColor ? 180 : 0;

    if (activeInkColor) {
      targetTopColor = activeInkColor;
      // Darken by 50% (multiply by 0.5)
      const r = ((activeInkColor >> 16) & 0xff) * 0.5;
      const g = ((activeInkColor >> 8) & 0xff) * 0.5;
      const b = (activeInkColor & 0xff) * 0.5;
      targetBottomColor =
        (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
    } else {
      targetTopColor = baseColors[0];
      targetBottomColor = baseColors[1];
    }

    const bgRef = {
      r0: (baseColors[0] >> 16) & 0xff,
      g0: (baseColors[0] >> 8) & 0xff,
      b0: baseColors[0] & 0xff,
      r1: (baseColors[1] >> 16) & 0xff,
      g1: (baseColors[1] >> 8) & 0xff,
      b1: baseColors[1] & 0xff,
    };

    gsap.to(bgRef, {
      r0: (targetTopColor >> 16) & 0xff,
      g0: (targetTopColor >> 8) & 0xff,
      b0: targetTopColor & 0xff,
      r1: (targetBottomColor >> 16) & 0xff,
      g1: (targetBottomColor >> 8) & 0xff,
      b1: targetBottomColor & 0xff,
      duration: 1,
      onUpdate: () => {
        mainRef.current.style.background = `linear-gradient(${gradientAngle}deg, rgb(${Math.round(bgRef.r0)}, ${Math.round(bgRef.g0)}, ${Math.round(bgRef.b0)}) 0%, rgb(${Math.round(bgRef.r1)}, ${Math.round(bgRef.g1)}, ${Math.round(bgRef.b1)}) 100%)`;
      },
    });
  }, [activeInkColor, baseColors]);

  return (
    <main
      ref={mainRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(0deg, #111 0%, #666 100%)",
      }}
    >
      <Loading loadedCount={cardsRevealed} totalCount={cardCount} />
      <AppProvider>
        <Canvas
          style={{ position: "relative", zIndex: 20 }}
          dpr={[2, 2]}
          onPointerMissed={() => setActiveId(null)}
          onCreated={({ gl }) => {
            if (gl?.xr) {
              gl.xr.enabled = false;
            }
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={28} />

          <OrbitControls
            enabled={true}
            enableZoom={false}
            enablePan={false}
            enableRotate={activeId === null}
            rotateSpeed={-0.25}
            autoRotate={false}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />

          <ambientLight intensity={0.5} />

          <Scrim
            active={activeId !== null}
            distance={openDistance}
            onClose={() => setActiveId(null)}
          />

          <Cylinder
            data={cardData}
            activeId={activeId}
            setActiveId={setActiveId}
            openDistance={openDistance}
            onThumbRevealed={handleCardRevealed}
          />
        </Canvas>
      </AppProvider>
      <Logo
        src="/lorcana_logo.png"
        alt="Lorcana Logo"
        position="top"
        maxWidth={240}
      />
      <Logo
        src="/first_chapter_logo.png"
        alt="The First Chapter"
        position="bottom"
        maxWidth={360}
      />
    </main>
  );
}
