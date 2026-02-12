import { Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef, useState } from "react";
import * as THREE from "three";

let currentHoverId = null;

export default function TeamCard({ member, ...props }) {
  const imageRef = useRef();
  const cardRef = useRef();
  const pivotRef = useRef();
  const lastAzimuthRef = useRef(null);
  const [hovered, setHover] = useState(false);

  const cardWidth = 3.6;
  const cardHeight = 5.0;
  const pivotOffsetY = cardHeight * 0.4; // 10% from top
  const maxTilt = Math.PI / 36; // Max tilt angle (radians)
  // const maxTilt = Math.PI / 18; // More tilt (20deg)
  // const maxTilt = Math.PI / 72; // Less tilt (5deg)

  useFrame((state, delta) => {
    const isActive = currentHoverId === member.id;
    const targetScale = isActive ? 2 : 1; // Hover scale
    const targetZ = isActive ? 0.2 : 0; // Hover lift (z)
    // const targetScale = isActive ? 1.5 : 1; // Subtle scale
    // const targetZ = isActive ? 0.1 : 0; // Subtle lift

    // ANIMATION 1: Scale up slightly when looked at
    easing.damp3(cardRef.current.scale, targetScale, 0.125, delta); // Scale smoothing
    easing.damp(imageRef.current.position, "z", targetZ, 0.125, delta); // Lift smoothing
    // easing.damp3(cardRef.current.scale, targetScale, 0.2, delta); // Slower scale
    // easing.damp(imageRef.current.position, "z", targetZ, 0.2, delta); // Slower lift

    // Sway based on camera azimuth speed (CCW positive)
    const azimuth = Math.atan2(
      state.camera.position.x,
      state.camera.position.z,
    );
    if (lastAzimuthRef.current === null) {
      lastAzimuthRef.current = azimuth;
      return;
    }
    const rawDelta = azimuth - lastAzimuthRef.current;
    const deltaAngle = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));
    lastAzimuthRef.current = azimuth;

    const velocity = deltaAngle / Math.max(delta, 0.0001); // rad/sec
    const targetTilt = Math.max(-maxTilt, Math.min(maxTilt, -velocity * 0.05)); // Tilt by speed
    // const targetTilt = Math.max(-maxTilt, Math.min(maxTilt, -velocity * 0.02)); // Gentler sway
    pivotRef.current.rotation.z = targetTilt;

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
    <group ref={cardRef} {...props}>
      <group ref={pivotRef} position={[0, pivotOffsetY, 0]}>
        <group position={[0, -pivotOffsetY, 0]}>
          {/* The Image Mesh */}
          <Image
            ref={imageRef}
            url={member.image} // Image URL/texture source
            transparent // Enable alpha transparency
            side={THREE.DoubleSide} // Render both sides
            radius={0.15} // Rounded corners radius
            scale={[cardWidth, cardHeight, 1]} // Width/height scale
            // position={[0, 0, 0]} // Local position
            // rotation={[0, 0, 0]} // Local rotation (radians)
            // toneMapped={false} // Ignore tone mapping
            // opacity={1} // Material opacity
            // zoom={1} // Texture zoom (drei Image)
            // grayscale={0} // 0 = full color, 1 = grayscale
            // EVENTS: Mouse pointer support
            onPointerOver={() => {
              currentHoverId = member.id;
              setHover(true);
              // document.body.style.cursor = "pointer"; // Change mouse cursor
              if (cardRef.current) {
                cardRef.current.renderOrder = 1;
              }
            }}
            onPointerOut={() => {
              if (currentHoverId === member.id) {
                currentHoverId = null;
              }
              setHover(false);
              // document.body.style.cursor = "auto";
              if (cardRef.current) {
                cardRef.current.renderOrder = 0;
              }
            }}
          />
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
