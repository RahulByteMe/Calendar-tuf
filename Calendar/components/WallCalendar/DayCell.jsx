"use client";

import { memo } from "react";
import { HOLIDAYS, WEEKDAYS_FULL, MONTH_THEMES } from "../../utils/monthThemes";
import { isSameDay, isInRange, toHolidayKey } from "../../utils/dateHelpers";

/**
 * DayCell — Individual calendar day
 * Memoized for performance (Feature 8)
 */
const DayCell = memo(function DayCell({
  dayObj, theme, today,
  rangeStartNorm, rangeEndNorm, rangeStart,
  hoveredDate, setHoveredDate,
  onDayClick, onDayDoubleClick,
  hasEvent, hasNote,
  isMobile,
}) {
  const { day, cur, date } = dayObj;
  const isToday = isSameDay(date, today);
  const isStart = isSameDay(date, rangeStartNorm);
  const isEnd = isSameDay(date, rangeEndNorm);
  const inRange = cur && isInRange(date, rangeStartNorm, rangeEndNorm);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const holiday = cur ? HOLIDAYS[toHolidayKey(date)] : null;
  const isDateHovered = cur && isSameDay(date, hoveredDate);

  // Preview range hover
  const isHoverPreview = cur && !rangeStartNorm && !rangeEndNorm && rangeStart && hoveredDate &&
    isInRange(date, rangeStart, hoveredDate);
  const isHoverEnd = cur && !rangeEndNorm && rangeStart && isSameDay(date, hoveredDate) && !isSameDay(date, rangeStart);

  let bg = "transparent";
  let textColor = cur ? (isWeekend ? `${theme.accent}cc` : "#3a3530") : "#ccc6be";
  let borderRadius = "50%";
  let fontWeight = isToday ? 600 : 400;
  let border = "none";
  let scale = 1;
  let shadow = "none";

  if (isStart || isEnd) {
    bg = theme.accent;
    textColor = "#fff";
    fontWeight = 700;
    scale = 1.05;
    shadow = `0 3px 14px ${theme.accent}50`;
  } else if (inRange) {
    bg = theme.accentLight;
    textColor = theme.accentDark;
    borderRadius = "0";
  } else if (isHoverPreview) {
    bg = `${theme.accentLight}cc`;
    textColor = theme.accentDark;
    borderRadius = "0";
  } else if (isHoverEnd) {
    bg = `${theme.accent}cc`;
    textColor = "#fff";
    fontWeight = 600;
    shadow = `0 2px 10px ${theme.accent}40`;
  }

  // Hover highlight for non-selected, non-range days
  if (isDateHovered && !isStart && !isEnd && !inRange && !isHoverPreview && !isHoverEnd && cur) {
    bg = `${theme.accentLight}90`;
    shadow = `0 2px 8px ${theme.accent}18`;
    scale = 1.02;
  }

  if (isToday && !isStart && !isEnd && !inRange) {
    border = `2px solid ${theme.accent}`;
    if (!isHoverEnd) textColor = theme.accent;
    shadow = `0 0 0 3px ${theme.accent}15`;
  }

  // range edge rounding
  if (isStart && (inRange || (rangeStart && hoveredDate && isInRange(rangeStart, rangeStart, hoveredDate))))
    borderRadius = "50% 0 0 50%";
  if (isEnd && inRange) borderRadius = "0 50% 50% 0";

  const isSelected = isStart || isEnd;

  // Accessible label (Fixed SSR Hydration mismatch by constructor manually)
  const dayIndex = (date.getDay() + 6) % 7; // Monday-based index
  const weekdayName = WEEKDAYS_FULL[dayIndex];
  const monthName = MONTH_THEMES[date.getMonth()].name;
  const dayLabel = `${weekdayName}, ${monthName} ${day}${holiday ? `, ${holiday.name}` : ""}${(hasEvent || hasNote) ? ", has note" : ""}${isToday ? ", today" : ""}`;

  return (
    <div
      onClick={() => cur && onDayClick(date)}
      onDoubleClick={() => cur && onDayDoubleClick(date)}
      onMouseEnter={() => setHoveredDate(date)}
      onMouseLeave={() => setHoveredDate(null)}
      onKeyDown={e => {
        if (cur && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onDayClick(date);
        }
      }}
      title={holiday ? holiday.name : undefined}
      role="gridcell"
      aria-label={dayLabel}
      aria-selected={isSelected}
      tabIndex={cur ? 0 : -1}
      style={{
        minWidth: 0,
        minHeight: 0,
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        borderRadius,
        background: bg,
        color: textColor,
        fontSize: 13,
        fontWeight,
        cursor: cur ? "pointer" : "default",
        border,
        position: "relative",
        transition: "background 0.15s ease, transform 0.12s ease, color 0.15s ease, box-shadow 0.18s ease",
        transform: `scale(${scale})`,
        userSelect: "none",
        zIndex: isSelected ? 2 : 1,
        boxShadow: shadow,
        outline: "none",
      }}
    >
      <span style={{ 
        lineHeight: 1, 
        fontWeight: 900, 
        fontSize: isMobile ? 18 : 24,
        marginBottom: 2
      }}>{day}</span>

      {/* Holiday info (direct name display, no emoji) */}
      {holiday && cur && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 2,
          width: "100%",
          padding: "0 4px",
          overflow: "hidden",
        }}>
          <span style={{
            fontSize: isMobile ? 8 : 9,
            lineHeight: 1.1,
            textAlign: "center",
            fontWeight: 900,
            letterSpacing: 0,
            color: isSelected ? "#fff" : theme.accentDark,
            opacity: isSelected ? 1 : 0.9,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            textTransform: "uppercase",
          }}>
            {holiday.name}
          </span>
        </div>
      )}

      {/* Note indicator dots (Enhanced Dual Indicators) */}
      {(hasEvent || hasNote) && !holiday && cur && (
        <div style={{
          position: "absolute",
          bottom: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
        }}>
          {hasEvent && (
            <span style={{
              width: 4.5, height: 4.5,
              borderRadius: "50%",
              background: isSelected ? "#fff" : "#e67e22",
              boxShadow: `0 0 4px ${isSelected ? "#fff" : "#e67e22"}60`,
              transition: "all 0.2s ease",
            }} />
          )}
          {hasNote && (
            <span style={{
              width: 4.5, height: 4.5,
              borderRadius: "50%",
              background: isSelected ? "#fff" : theme.accent,
              boxShadow: `0 0 4px ${isSelected ? "#fff" : theme.accent}60`,
              transition: "all 0.2s ease",
            }} />
          )}
        </div>
      )}
    </div>
  );
});

export default DayCell;
