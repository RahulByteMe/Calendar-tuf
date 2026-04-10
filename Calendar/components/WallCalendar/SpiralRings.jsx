"use client";

export default function SpiralRings({ color, isMobile }) {
  const numRings = isMobile ? 11 : 18;
  const ringWidth = isMobile ? 14 : 20;
  const ringHeight = isMobile ? 22 : 28;
  const ringGap = isMobile ? 8 : 10;
  const paddingH = isMobile ? 10 : 30;

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      gap: ringGap, padding: `0 ${paddingH}px`, marginBottom: -4,
      position: "relative", zIndex: 10,
    }}>
      {Array.from({ length: numRings }).map((_, i) => (
        <div key={i} style={{
          width: ringWidth, height: ringHeight,
          borderRadius: "50%",
          border: `3px solid ${color}50`,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          boxShadow: `0 2px 6px ${color}20`,
          flexShrink: 0,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", bottom: -2, left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? 4 : 6, height: isMobile ? 4 : 6,
            borderRadius: "50%",
            background: `${color}40`,
          }} />
        </div>
      ))}
    </div>
  );
}
