import Card from "../Card/Card";
import { CARD_CONFIG } from "../../constants/useCardConfig";

export default function Cylinder({
  data,
  activeId,
  setActiveId,
  onThumbRevealed,
  cameraStateRef,
}) {
  const count = data.length;
  const {
    radius,
    rowCount,
    width: cardWidth,
    height: cardHeight,
    horizontalGap,
    verticalGap,
  } = CARD_CONFIG;
  const rowGap = cardHeight + verticalGap;
  const perRow = Math.ceil(count / rowCount);
  const rowOffsets = [0, rowGap, -rowGap];
  const rowCounts = Array.from({ length: rowCount }, (_, row) =>
    Math.max(0, Math.min(perRow, count - row * perRow)),
  );

  return (
    <group>
      {data.map((member, i) => {
        const rowIndex = Math.min(rowCount - 1, Math.floor(i / perRow));
        const rowPosition = i - rowIndex * perRow;
        const rowCountForAngle = rowCounts[rowIndex];
        const minRadiusForGap =
          (rowCountForAngle * (cardWidth + horizontalGap)) / (Math.PI * 2);
        const effectiveRadius = Math.max(radius, minRadiusForGap);
        const angleStep = (Math.PI * 2) / rowCountForAngle;
        const angle = rowPosition * angleStep;

        const x = Math.sin(angle) * effectiveRadius;
        const z = Math.cos(angle) * effectiveRadius;
        const y = rowOffsets[rowIndex];

        const rotY = angle + Math.PI;

        return (
          <Card
            key={member.id}
            position={[x, y, z]}
            rotation={[0, rotY, 0]}
            member={member}
            index={i}
            activeId={activeId}
            setActiveId={setActiveId}
            onThumbRevealed={onThumbRevealed}
            cameraStateRef={cameraStateRef}
          />
        );
      })}
    </group>
  );
}
