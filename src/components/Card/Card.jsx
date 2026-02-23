import { Image, useTexture } from "@react-three/drei";
import { memo, Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useHover } from "../../context/AppContext";
import { useCardAnimation } from "./useCardAnimation";

const Card = memo(function Card({
  member,
  index,
  activeId,
  setActiveId,
  onThumbRevealed,
  cameraStateRef,
  ...props
}) {
  const { currentHoverId, setCurrentHoverId } = useHover();
  const imageRef = useRef();
  const rootRef = useRef();
  const cardRef = useRef();
  const backMaterialRef = useRef();
  const pivotRef = useRef();
  const basePositionRef = useRef(new THREE.Vector3());
  const baseQuaternionRef = useRef(new THREE.Quaternion());
  const pointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const draggedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [fullTexture, setFullTexture] = useState(null);
  const isOpen = activeId === member.id;
  const backTexture = useTexture("/cardback.jpg");
  const thumbTexture = useTexture(member.thumb);
  const imageTexture = isOpen && fullTexture ? fullTexture : thumbTexture;

  useEffect(() => {
    rootRef.current.renderOrder = 1;
    if (props.position) basePositionRef.current.fromArray(props.position);
    if (props.rotation) {
      baseQuaternionRef.current.setFromEuler(
        new THREE.Euler(...props.rotation),
      );
    } else {
      baseQuaternionRef.current.identity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.position?.[0], props.rotation?.[0]]);

  useEffect(() => {
    const timer = setTimeout(
      () => setRevealed(true),
      Math.max(0, index ?? 0) * 5,
    );
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (revealed) onThumbRevealed?.();
  }, [revealed, onThumbRevealed]);

  useEffect(() => {
    if (imageTexture?.image && imageRef.current) {
      imageRef.current.material.opacity = 0;
    }
  }, [imageTexture]);

  useEffect(() => {
    if (!isOpen || fullTexture || !member.full) return;
    let isActiveLoad = true;
    const loader = new THREE.TextureLoader();
    loader.load(member.full, (texture) => {
      if (!isActiveLoad) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      setFullTexture(texture);
    });
    return () => {
      isActiveLoad = false;
    };
  }, [isOpen, fullTexture, member.full]);

  useCardAnimation(
    rootRef,
    cardRef,
    pivotRef,
    imageRef,
    basePositionRef,
    baseQuaternionRef,
    member,
    isOpen,
    currentHoverId,
    revealed,
    cameraStateRef,
  );

  const { width: cardWidth, height: cardHeight } = { width: 3.6, height: 5.0 };

  const pivotOffsetY = 5.0 * 0.4;

  return (
    <group ref={rootRef} position={props.position} rotation={props.rotation}>
      <group ref={pivotRef} position={[0, pivotOffsetY, 0]}>
        <group ref={cardRef} position={[0, -pivotOffsetY, 0]}>
          {!revealed && (
            <mesh position={[0, 0, -0.011]} renderOrder={2}>
              <planeGeometry args={[cardWidth, cardHeight]} />
              <meshBasicMaterial
                map={backTexture}
                transparent
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          <Image
            texture={backTexture}
            scale={[cardWidth, cardHeight, 1]}
            transparent
            opacity={1}
            side={THREE.FrontSide}
            radius={0.15}
            position={[0, 0, -0.01]}
            rotation={[0, Math.PI, 0]}
            onUpdate={(self) => {
              backMaterialRef.current = self.material;
            }}
          />
          <Suspense fallback={null}>
            <Image
              ref={imageRef}
              texture={imageTexture}
              transparent
              opacity={0}
              side={THREE.FrontSide}
              radius={0.15}
              scale={[cardWidth, cardHeight, 1]}
              onPointerDown={(event) => {
                pointerDownRef.current = true;
                draggedRef.current = false;
                pointerStartRef.current = {
                  x: event.clientX,
                  y: event.clientY,
                };
              }}
              onPointerMove={(event) => {
                if (!pointerDownRef.current || draggedRef.current) return;
                const dx = event.clientX - pointerStartRef.current.x;
                const dy = event.clientY - pointerStartRef.current.y;
                if (dx * dx + dy * dy > 36) {
                  draggedRef.current = true;
                }
              }}
              onPointerUp={() => {
                pointerDownRef.current = false;
              }}
              onPointerLeave={() => {
                pointerDownRef.current = false;
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (draggedRef.current) {
                  draggedRef.current = false;
                  return;
                }
                setActiveId?.(activeId === member.id ? null : member.id);
              }}
              onPointerOver={() => {
                if (activeId !== null && activeId !== member.id) return;
                setCurrentHoverId(member.id);
                if (rootRef.current) rootRef.current.renderOrder = 1;
              }}
              onPointerOut={() => {
                if (activeId !== null && activeId !== member.id) return;
                if (currentHoverId === member.id) setCurrentHoverId(null);
                if (rootRef.current) rootRef.current.renderOrder = 0;
              }}
            />
          </Suspense>
        </group>
      </group>
    </group>
  );
});

export default Card;
