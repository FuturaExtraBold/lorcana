import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { AppProvider } from "./AppContext";
import Cylinder from "./Cylinder";
import Loading from "./Loading";
import { useGradientAnimation } from "./useGradientAnimation";

function Scrim({ active, distance = 40 }) {
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
  const cardData = Array.from({ length: 204 }).map((_, i) => ({
    id: i,
    thumb: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
    inkColor: inkColors[Math.floor(i / 34)],
  }));
  const activeInkColor = cardData[activeId]?.inkColor ?? null;
  const cardCount = cardData.length;
  const handleCardRevealed = useCallback(() => {
    setCardsRevealed((count) => Math.min(cardCount, count + 1));
  }, [cardCount]);

  useGradientAnimation(mainRef, activeInkColor, baseColors);

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
      <img
        src="/lorcana_logo.png"
        alt="Lorcana Logo"
        style={{
          position: "absolute",
          top: 40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          maxWidth: 240,
          width: "20%",
          userSelect: "none",
        }}
      />
      <img
        src="/first_chapter_logo.png"
        alt="The First Chapter"
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          maxWidth: 360,
          width: "20%",
          userSelect: "none",
        }}
      />
    </main>
  );
}
