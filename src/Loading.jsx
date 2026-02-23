export default function Loading({ loadedCount, totalCount }) {
  const isLoading = loadedCount < totalCount;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 50,
        opacity: isLoading ? 1 : 0,
        transition: "opacity 300ms ease",
        pointerEvents: isLoading ? "auto" : "none",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "4px solid rgba(255, 255, 255, 0.35)",
          borderTopColor: "white",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
}
