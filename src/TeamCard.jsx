import { Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef, useState } from "react";
import * as THREE from "three";

export default function TeamCard({ member, ...props }) {
  const imageRef = useRef();
  const cardRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    const targetScale = hovered ? 2 : 1;

    // ANIMATION 1: Scale up slightly when looked at
    easing.damp3(cardRef.current.scale, targetScale, 0.125, delta);
    easing.damp(
      imageRef.current.position,
      "z",
      hovered ? 0.2 : 0,
      0.125,
      delta,
    );

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
      {/* The Image Mesh */}
      <Image
        ref={imageRef}
        url={member.image}
        transparent
        side={THREE.DoubleSide}
        radius={0.15}
        scale={[3.6, 5.0, 1]} // 100% size
        // EVENTS: These work with Mouse AND VR Controllers
        onPointerOver={() => {
          setHover(true);
          // document.body.style.cursor = "pointer"; // Change mouse cursor
          if (cardRef.current) {
            cardRef.current.renderOrder = 1;
          }
        }}
        onPointerOut={() => {
          setHover(false);
          // document.body.style.cursor = "auto";
          if (cardRef.current) {
            cardRef.current.renderOrder = 0;
          }
        }}
      />

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
