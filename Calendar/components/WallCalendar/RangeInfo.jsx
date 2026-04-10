"use client";

import { fmtShort } from "../../utils/dateHelpers";

export default function RangeInfo({ rangeStart, rangeEndNorm, rangeStartNorm, rangeDays, clearRange, theme }) {
  if (!rangeStart) return null;

  return (
    <div style={{
      background: theme.accentLight,
      border: `1px solid ${theme.accent}28`,
      borderRadius: 8,
      padding: "9px 14px",
      marginBottom: 14,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 12.5,
      color: theme.accentDark,
      animation: "fadeUp 0.3s ease",
    }}>
      <span style={{ fontWeight: 500 }}>
        {rangeEndNorm
          ? `📅 ${fmtShort(rangeStartNorm)} → ${fmtShort(rangeEndNorm)} · ${rangeDays} day${rangeDays !== 1 ? "s" : ""}`
          : `📌 From ${fmtShort(rangeStart)} — pick end date`}
      </span>
      <button
        id="clear-range-btn"
        onClick={clearRange}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "#b0a898", padding: "2px 8px",
          borderRadius: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => e.currentTarget.style.color = theme.accent}
        onMouseLeave={e => e.currentTarget.style.color = "#b0a898"}
      >
        clear ×
      </button>
    </div>
  );
}
