import TeamCard from "./TeamCard";

export default function CylinderLayout({ data, radius = 5 }) {
  const count = data.length;
  const rowCount = 3; // Number of vertical rows
  const cardWidth = 3.6; // Card width
  const cardHeight = 5.0; // Card height
  const horizontalGap = 0.25; // Gap between cards around the ring
  const verticalGap = 0.25; // Gap between rows
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

        // MATH: Place around the circle
        const x = Math.sin(angle) * effectiveRadius;
        const z = Math.cos(angle) * effectiveRadius;
        const y = rowOffsets[rowIndex];

        // ROTATION: They must face the center (0,0,0)
        // We add PI (180 deg) so the image faces INWARD, not outward
        const rotY = angle + Math.PI;

        return (
          <TeamCard
            key={member.id}
            position={[x, y, z]}
            rotation={[0, rotY, 0]}
            member={member}
          />
        );
      })}
    </group>
  );
}
