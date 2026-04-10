"use client";

import DayCell from "./DayCell";
import RangeInfo from "./RangeInfo";
import { MONTH_THEMES, WEEKDAYS, WEEKDAYS_FULL } from "../../utils/monthThemes";
import { toDateKey } from "../../utils/dateHelpers";

export default function CalendarGrid({
  days,
  theme,
  today,
  month,
  year,
  isMobile,
  isCurrentMonth,
  rangeStart,
  rangeStartNorm,
  rangeEndNorm,
  rangeDays,
  hoveredDate,
  setHoveredDate,
  handleDayClick,
  handleDayDoubleClick,
  clearRange,
  notes,
  /* for month-dot nav */
  setFlipDir,
  setIsFlipping,
  setCurDate,
}) {
  return (
    <div style={{
      padding: isMobile ? "18px 14px" : "22px 20px",
      order: isMobile ? 1 : 2,
    }}>

      {/* Range bar */}
      <RangeInfo
        rangeStart={rangeStart}
        rangeStartNorm={rangeStartNorm}
        rangeEndNorm={rangeEndNorm}
        rangeDays={rangeDays}
        clearRange={clearRange}
        theme={theme}
      />

      {/* Weekday headers */}
      <div
        role="row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            role="columnheader"
            aria-label={WEEKDAYS_FULL[i]}
            style={{
              textAlign: "center",
              fontSize: isMobile ? 9.5 : 10.5,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "4px 0",
              color: i >= 5 ? `${theme.accent}cc` : "#c5bfb8",
            }}
          >
            {isMobile ? d[0] : d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        role="grid"
        aria-label="Calendar days"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: isMobile ? 1 : 2,
          "--day-hover-bg": theme.accentLight,
          "--day-hover-color": theme.accentDark,
        }}
      >
        {days.map((dayObj, idx) => {
          const dayNoteKey = `day-${toDateKey(dayObj.date)}`;
          const dayNote = notes[dayNoteKey];
          return (
            <DayCell
              key={idx}
              dayObj={dayObj}
              theme={theme}
              today={today}
              rangeStartNorm={rangeStartNorm}
              rangeEndNorm={rangeEndNorm}
              rangeStart={rangeStart}
              hoveredDate={hoveredDate}
              setHoveredDate={setHoveredDate}
              onDayClick={handleDayClick}
              onDayDoubleClick={handleDayDoubleClick}
              hasEvent={!!(dayNote?.event?.trim())}
              hasNote={!!(dayNote?.note?.trim())}
              isMobile={isMobile}
            />
          );
        })}
      </div>

      {/* Bottom row: month navigation dots + today info */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid #f0ece5",
      }}>
        {/* Month dots */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {MONTH_THEMES.map((m, i) => (
            <button
              key={m.name}
              onClick={() => {
                if (i !== month) {
                  setFlipDir(i > month ? 1 : -1);
                  setIsFlipping(true);
                  setTimeout(() => {
                    setCurDate(new Date(year, i, 1));
                    setIsFlipping(false);
                  }, 340);
                }
              }}
              title={m.name}
              aria-label={`Go to ${m.name}`}
              style={{
                width: i === month ? 18 : 7,
                height: 7,
                borderRadius: 4,
                background: i === month ? m.accent : `${m.accent}50`,
                border: "none", cursor: "pointer",
                padding: 0,
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>

        {/* Today info */}
        <div style={{ fontSize: 11, color: "#b8b0a6", textAlign: "right" }}>
          {isCurrentMonth && (
            <span style={{ color: theme.accent, fontWeight: 500 }}>
              {WEEKDAYS_FULL[today.getDay() === 0 ? 6 : today.getDay() - 1]}, {today.getDate()} {theme.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
