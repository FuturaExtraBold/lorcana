import { Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

let currentHoverId = null;

export default function TeamCard({
  member,
  index,
  activeId,
  setActiveId,
  openDistance = 40,
  ...props
}) {
  const imageRef = useRef();
  const rootRef = useRef();
  const cardRef = useRef();
  const backMeshRef = useRef();
  const backMaterialRef = useRef();
  const pivotRef = useRef();
  const lastAzimuthRef = useRef(null);
  const textureConfigRef = useRef({ map: null });
  const basePositionRef = useRef(new THREE.Vector3());
  const baseQuaternionRef = useRef(new THREE.Quaternion());
  const openQuaternionRef = useRef(new THREE.Quaternion());
  const tempQuaternionRef = useRef(new THREE.Quaternion());
  const spinQuaternionRef = useRef(new THREE.Quaternion());
  const openProgressRef = useRef(0);
  const [hovered, setHover] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isOpen = activeId === member.id;
  const spinAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tempPositionRef = useRef(new THREE.Vector3());
  const cameraPositionRef = useRef(new THREE.Vector3());
  const cameraDirectionRef = useRef(new THREE.Vector3());
  const openTargetPositionRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.renderOrder = 1;
    }
  }, []);

  useEffect(() => {
    if (props.position) {
      basePositionRef.current.fromArray(props.position);
    }
    if (props.rotation) {
      baseQuaternionRef.current.setFromEuler(
        new THREE.Euler(...props.rotation),
      );
    } else {
      baseQuaternionRef.current.identity();
    }
    openQuaternionRef.current.copy(baseQuaternionRef.current);
  }, [props.position, props.rotation]);

  useEffect(() => {
    const delay = Math.max(0, index ?? 0) * 50;
    const timer = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  const cardWidth = 3.6;
  const cardHeight = 5.0;
  const backUrl = "/cardback.jpg";
  const pivotOffsetY = cardHeight * 0.4; // 10% from top
  const baseScale = 1.0; // Resting scale
  const activeScale = 1.5; // Hover scale
  const openScale = 2.6; // Full size scale
  const maxTilt = Math.PI / 36; // Max tilt angle (radians)
  // const maxTilt = Math.PI / 18; // More tilt (20deg)
  // const maxTilt = Math.PI / 72; // Less tilt (5deg)

  useFrame((state, delta) => {
    if (!rootRef.current || !cardRef.current || !pivotRef.current) {
      return;
    }
    const openTarget = isOpen ? 1 : 0;
    const openSpeed = isOpen ? 6 : 12;
    openProgressRef.current = THREE.MathUtils.damp(
      openProgressRef.current,
      openTarget,
      openSpeed,
      delta,
    );
    const openMix = openProgressRef.current;

    const isActive = currentHoverId === member.id;
    const isOpeningOrClosing = openMix > 0.001;

    if (!isOpeningOrClosing && imageRef.current) {
      const targetScale = isActive ? activeScale : baseScale; // Hover scale
      const targetZ = isActive ? 0.35 : 0; // Hover lift (z)
      // const targetScale = isActive ? 0.85 : 0.5; // Subtle scale
      // const targetZ = isActive ? 0.08 : 0; // Subtle lift

      // ANIMATION 1: Scale up slightly when looked at
      easing.damp3(cardRef.current.scale, targetScale, 0.125, delta); // Scale smoothing
      easing.damp(imageRef.current.position, "z", targetZ, 0.125, delta); // Lift smoothing
    } else if (imageRef.current) {
      cardRef.current.scale.setScalar(1);
      imageRef.current.position.z = 0;
    }
    // easing.damp3(cardRef.current.scale, targetScale, 0.2, delta); // Slower scale
    // easing.damp(imageRef.current.position, "z", targetZ, 0.2, delta); // Slower lift

    // Sway based on camera azimuth speed (CCW positive)
    const azimuth = Math.atan2(
      state.camera.position.x,
      state.camera.position.z,
    );
    let deltaAngle = 0;
    if (lastAzimuthRef.current !== null) {
      const rawDelta = azimuth - lastAzimuthRef.current;
      deltaAngle = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));
    }
    lastAzimuthRef.current = azimuth;

    const velocity = deltaAngle / Math.max(delta, 0.0001); // rad/sec
    const targetTilt = isOpen
      ? 0
      : Math.max(-maxTilt, Math.min(maxTilt, -velocity * 0.05)); // Tilt by speed
    // const targetTilt = Math.max(-maxTilt, Math.min(maxTilt, -velocity * 0.02)); // Gentler sway
    pivotRef.current.rotation.z = targetTilt;

    if (imageRef.current?.material) {
      const isFront = isOpen || openMix > 0.001;
      if (isFront) {
        imageRef.current.material.depthTest = false;
        imageRef.current.material.depthWrite = false;
        imageRef.current.renderOrder = 10;
        if (rootRef.current) {
          rootRef.current.renderOrder = 10;
        }
        if (backMeshRef.current) {
          backMeshRef.current.renderOrder = 10;
        }
        if (backMaterialRef.current) {
          backMaterialRef.current.depthTest = false;
          backMaterialRef.current.depthWrite = false;
        }
      } else if (isActive) {
        imageRef.current.material.depthTest = false;
        imageRef.current.material.depthWrite = false;
        imageRef.current.renderOrder = 2;
        if (rootRef.current) {
          rootRef.current.renderOrder = 2;
        }
        if (backMeshRef.current) {
          backMeshRef.current.renderOrder = 2;
        }
        if (backMaterialRef.current) {
          backMaterialRef.current.depthTest = true;
          backMaterialRef.current.depthWrite = false;
        }
      } else {
        imageRef.current.material.depthTest = true;
        imageRef.current.material.depthWrite = true;
        imageRef.current.renderOrder = 1;
        if (rootRef.current) {
          rootRef.current.renderOrder = 1;
        }
        if (backMeshRef.current) {
          backMeshRef.current.renderOrder = 1;
        }
        if (backMaterialRef.current) {
          backMaterialRef.current.depthTest = true;
          backMaterialRef.current.depthWrite = false;
        }
      }
      const targetOpacity = revealed ? 1 : 0;
      easing.damp(
        imageRef.current.material,
        "opacity",
        targetOpacity,
        0.2,
        delta,
      );
    }

    state.camera.getWorldPosition(cameraPositionRef.current);
    state.camera.getWorldDirection(cameraDirectionRef.current);
    openTargetPositionRef.current
      .copy(cameraPositionRef.current)
      .addScaledVector(cameraDirectionRef.current, openDistance);
    tempPositionRef.current.copy(openTargetPositionRef.current);
    rootRef.current.position.lerpVectors(
      basePositionRef.current,
      tempPositionRef.current,
      openMix,
    );
    const scale = THREE.MathUtils.lerp(1, openScale, openMix);
    rootRef.current.scale.setScalar(scale);

    tempQuaternionRef.current
      .copy(baseQuaternionRef.current)
      .slerp(openQuaternionRef.current, openMix);
    if (isOpen) {
      const spinAngle = -Math.PI * 2 * openMix;
      spinQuaternionRef.current.setFromAxisAngle(spinAxis, spinAngle);
      tempQuaternionRef.current.multiply(spinQuaternionRef.current);
    }
    rootRef.current.quaternion.copy(tempQuaternionRef.current);

    if (imageRef.current?.material?.map) {
      const map = imageRef.current.material.map;
      if (textureConfigRef.current.map !== map) {
        textureConfigRef.current.map = map;
        map.minFilter = THREE.LinearMipmapLinearFilter;
        map.magFilter = THREE.LinearFilter;
        map.anisotropy = Math.min(4, state.gl.capabilities.getMaxAnisotropy());
        map.needsUpdate = true;
      }
    }

    // ANIMATION 2: Highlight the material color or brightness
    // (Visual feedback that it's active)
    // easing.damp(
    //   imageRef.current.material,
    //   "zoom",
    //   hovered ? 1.2 : 1,
    //   0.125,
    //   delta,
    // );

    // Optional: Make it face the camera perfectly if needed
    // group.current.lookAt(state.camera.position)
  });

  return (
    <group ref={rootRef} position={props.position} rotation={props.rotation}>
      <group ref={pivotRef} position={[0, pivotOffsetY, 0]}>
        <group ref={cardRef} position={[0, -pivotOffsetY, 0]}>
          {/* Back of card */}
          <Image
            ref={backMeshRef}
            url={backUrl}
            scale={[cardWidth, cardHeight, 1]}
            radius={0.15}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
            position={[0, 0, -0.01]}
            onUpdate={(self) => {
              backMaterialRef.current = self.material;
              const map = self.material?.map;
              if (map) {
                map.wrapS = THREE.RepeatWrapping;
                map.repeat.x = -1;
                map.offset.x = 1;
                map.needsUpdate = true;
              }
            }}
          />

          {/* The Image Mesh */}
          <Suspense fallback={null}>
            <Image
              ref={imageRef}
              url={isOpen ? member.full : member.thumb} // Full image when open
              transparent // Enable alpha transparency
              opacity={0} // Start hidden for reveal
              side={THREE.FrontSide} // Front only (back is separate)
              radius={0.15} // Rounded corners radius
              scale={[cardWidth, cardHeight, 1]} // Width/height scale
              // position={[0, 0, 0]} // Local position
              // rotation={[0, 0, 0]} // Local rotation (radians)
              // toneMapped={false} // Ignore tone mapping
              // opacity={1} // Material opacity
              // zoom={1} // Texture zoom (drei Image)
              // grayscale={0} // 0 = full color, 1 = grayscale
              // EVENTS: Mouse pointer support
              onClick={(event) => {
                event.stopPropagation();
                setActiveId?.(member.id);
              }}
              onPointerOver={() => {
                if (activeId !== null && activeId !== member.id) {
                  return;
                }
                currentHoverId = member.id;
                setHover(true);
                // document.body.style.cursor = "pointer"; // Change mouse cursor
                if (rootRef.current) {
                  rootRef.current.renderOrder = 1;
                }
              }}
              onPointerOut={() => {
                if (activeId !== null && activeId !== member.id) {
                  return;
                }
                if (currentHoverId === member.id) {
                  currentHoverId = null;
                }
                setHover(false);
                // document.body.style.cursor = "auto";
                if (rootRef.current) {
                  rootRef.current.renderOrder = 0;
                }
              }}
            />
          </Suspense>
        </group>
      </group>

      {/* Name Tag - Only shows when hovered */}
      {/* <Text
        position={[0, -2.5, 0.1]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        opacity={hovered ? 1 : 0}
      >
        Member {member.id + 1}
      </Text> */}
    </group>
  );
}
