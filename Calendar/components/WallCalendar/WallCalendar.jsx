"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ── Sub-components ─────────────────────────────────────────── */
import SpiralRings from "./SpiralRings";
import HeroImage from "./HeroImage";
import CalendarGrid from "./CalendarGrid";
import NoteModal from "./NoteModal";
import MonthNotesModal from "./MonthNotesModal";

/* ── Data & Utilities ───────────────────────────────────────── */
import { MONTH_THEMES } from "../../utils/monthThemes";
import {
  toDateKey,
  isSameDay,
  fmtShort,
  buildGrid,
} from "../../utils/dateHelpers";

/* ═══════════════════════════════════════════════════════════════
   WallCalendar — root component
   State management + orchestration of sub-components
   ═══════════════════════════════════════════════════════════════ */
export default function WallCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ── State ────────────────────────────────────────────────── */
  const [curDate, setCurDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [notes, setNotes] = useState({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState(1);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [modalDate, setModalDate] = useState(null); // for NoteModal
  const [showMonthNotes, setShowMonthNotes] = useState(false); // for MonthNotesModal

  const month = curDate.getMonth();
  const year = curDate.getFullYear();
  const theme = MONTH_THEMES[month];
  const days = buildGrid(year, month);

  /* ── Effects ──────────────────────────────────────────────── */

  // Responsive breakpoint & Vertical/Horizontal Auto-Scaling
  useEffect(() => {
    const check = () => {
      const isMob = window.innerWidth < 680;
      setIsMobile(isMob);
      
      if (!isMob) {
        // Automatically scale down on short/narrow screens to prevent scrolling
        const availableHeight = window.innerHeight;
        const availableWidth = window.innerWidth;
        
        let scaleH = availableHeight / 980; // 980px is the approx total height with padding
        let scaleW = availableWidth / 960;  // 960px accounts for max-width + page padding
        
        let newScale = Math.min(scaleH, scaleW);
        if (newScale > 1) newScale = 1;       // Don't blow it up on huge screens
        if (newScale < 0.4) newScale = 0.4;   // Cap minimum readability
        
        setScale(newScale);
      } else {
        setScale(1); // Mobile naturally scrolls, leave at 1x
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Persist notes to localStorage (Feature 4 — new data structure)
  // Migrates old string-value format to new object format on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wall-calendar-notes");
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = {};
        for (let [key, value] of Object.entries(parsed)) {
          // Detect old unpadded/unnormalized keys (e.g., day-2026-5-9)
          if (key.startsWith("day-") && (key.split("-").length === 4)) {
             const parts = key.split("-"); // ["day", "2026", "5", "9"]
             const y = parts[1];
             const m = parts[2];
             const d = parts[3];
             
             // If m or d are single digits, this is an old key
             if (m.length === 1 || d.length === 1) {
                // Correct for 0-indexed vs 1-indexed (old format used d.getMonth())
                // So "5" meant June. New format expects "06".
                const newM = String(Number(m) + 1).padStart(2, "0");
                const newD = d.padStart(2, "0");
                key = `day-${y}-${newM}-${newD}`;
             }
          }

          if (typeof value === "string") {
            if (value.trim()) {
              migrated[key] = { event: "", note: value, type: "note", createdAt: Date.now() };
            }
          } else if (value && typeof value === "object") {
            migrated[key] = {
              event: value.event || (value.type === "event" ? value.note : ""),
              note: value.note || (value.type === "note" ? value.note : ""),
              type: value.type || "note",
              createdAt: value.createdAt || Date.now(),
            };
          }
        }
        setNotes(migrated);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wall-calendar-notes", JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Keyboard & Scroll navigation
  const lastScroll = useRef(0);
  useEffect(() => {
    if (modalDate) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") goMonth(1);
      if (e.key === "ArrowLeft") goMonth(-1);
    };
    const wheelHandler = (e) => {
      if (modalDate || showMonthNotes) return;
      const now = Date.now();
      if (now - lastScroll.current < 600) return;

      if (Math.abs(e.deltaX) > 35) {
        goMonth(e.deltaX > 0 ? 1 : -1);
        lastScroll.current = now;
      }
    };

    window.addEventListener("keydown", handler);
    window.addEventListener("wheel", wheelHandler, { passive: true });
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("wheel", wheelHandler);
    };
  }, [month, year, isFlipping, modalDate, showMonthNotes]);

  /* ── Handlers ─────────────────────────────────────────────── */

  function goMonth(dir) {
    if (isFlipping) return;
    setFlipDir(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setCurDate(new Date(year, month + dir, 1));
      setIsFlipping(false);
    }, 340);
  }

  function goToToday() {
    if (isFlipping) return;
    const diff = (today.getFullYear() * 12 + today.getMonth()) - (year * 12 + month);
    if (diff === 0) return;
    setFlipDir(diff > 0 ? 1 : -1);
    setIsFlipping(true);
    setTimeout(() => {
      setCurDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setIsFlipping(false);
    }, 340);
  }

  function handleDayClick(date) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      if (isSameDay(date, rangeStart)) {
        setRangeStart(null);
      } else {
        setRangeEnd(date);
      }
    }
  }

  // Double-click opens note modal (Feature 1)
  const handleDayDoubleClick = useCallback((date) => {
    setModalDate(date);
  }, []);

  function closeModal() {
    setModalDate(null);
  }

  // Save from modal (Enhanced Dual-Content Save)
  function saveModalNote(eventText, noteText, type) {
    if (!modalDate) return;
    const key = `day-${toDateKey(modalDate)}`;
    
    if (!eventText.trim() && !noteText.trim()) {
      // Remove empty entries entirely
      setNotes(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setNotes(prev => ({
        ...prev,
        [key]: {
          event: eventText.trim(),
          note: noteText.trim(),
          type: type, // which tab was last active
          createdAt: prev[key]?.createdAt || Date.now(),
        },
      }));
    }
  }

  // Explicit deletion (Enhanced for Event/Note)
  function handleDeleteEntry(dateKey, type) {
    setNotes(prev => {
      const entry = prev[dateKey];
      if (!entry) return prev;
      
      const next = { ...prev };
      if (type === "event") {
        next[dateKey] = { ...next[dateKey], event: "" };
      } else if (type === "note") {
        next[dateKey] = { ...next[dateKey], note: "" };
      } else {
        delete next[dateKey];
        return next;
      }
      
      // If both now empty, cleanup
      if (!next[dateKey].event.trim() && !next[dateKey].note.trim()) {
        delete next[dateKey];
      }
      return next;
    });
  }

  function clearRange() {
    setRangeStart(null);
    setRangeEnd(null);
  }

  // Updated for new data structure (Feature 4)
  // Updated for new data structure (Feature 4 - no longer used by NotesPanel but kept for internal logic if needed, actually safely removable)
  // Removing updateNote as it is no longer used by any component


  /* ── Derived values ───────────────────────────────────────── */
  const rangeStartNorm = rangeStart && rangeEnd && rangeStart > rangeEnd ? rangeEnd : rangeStart;
  const rangeEndNorm   = rangeStart && rangeEnd && rangeStart > rangeEnd ? rangeStart : rangeEnd;
  const rangeDays      = rangeStartNorm && rangeEndNorm
    ? Math.round((rangeEndNorm - rangeStartNorm) / 86400000) + 1 : null;

  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // Modal data
  const modalNoteKey = modalDate ? `day-${toDateKey(modalDate)}` : null;
  const modalNoteData = modalNoteKey ? notes[modalNoteKey] || null : null;

  /* ── Flip animation ───────────────────────────────────────── */
  const flipStyle = {
    opacity: isFlipping ? 0 : 1,
    transform: isFlipping
      ? `perspective(1400px) rotateY(${flipDir > 0 ? -8 : 8}deg) translateY(6px) scale(0.97)`
      : "perspective(1400px) rotateY(0deg) translateY(0) scale(1)",
    transition: "opacity 0.32s ease, transform 0.32s cubic-bezier(0.4,0,0.2,1)",
  };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(${theme.gradient})`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: isMobile ? "1.5rem 0.75rem 3rem" : "2.5rem 1.5rem 4rem",
      transition: "background 0.7s ease",
    }}>
      {/* Google Fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=Space+Mono&display=swap" />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cal-day:hover:not(.cal-day--disabled) {
          background: var(--day-hover-bg) !important;
          color: var(--day-hover-color) !important;
          border-radius: 50% !important;
        }
        * { box-sizing: border-box; }
        textarea::placeholder { color: #c0bdb8; font-style: italic; }
        textarea { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{ 
          width: "100%", 
          maxWidth: 920, 
          zoom: scale, 
          // Fallback scaling for Firefox which doesn't support 'zoom' 
          MozTransform: scale < 1 ? `scale(${scale})` : "none",
          MozTransformOrigin: "top center",
      }}>
        {/* Spiral binding */}
        <SpiralRings color={theme.accent} isMobile={isMobile} />

        {/* ── Main Card ────────────────────────────────────── */}
        <div style={{
          background: "#fefcfa",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
          ...flipStyle,
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
        }}>

          {/* Branding (Inside Card) */}
          <div style={{
            textAlign: "center",
            padding: "24px 0 12px",
            background: theme.accentDark,
            borderBottom: "none",
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "clamp(20px, 6vw, 28px)" : 48,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: isMobile ? 2 : 8,
              textTransform: "uppercase",
              margin: 0,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              textAlign: "center",
              gap: isMobile ? 8 : 20,
            }}>
              <img 
                src="/months/logo/image.webp" 
                alt="TUF" 
                style={{ height: isMobile ? 24 : 56, maxWidth: "100%", objectFit: "contain" }} 
              />
              <span>Calendar</span>
            </h1>
            <div style={{
              width: 50,
              height: 4,
              background: "rgba(255,255,255,0.4)",
              margin: "8px auto 0",
              borderRadius: 2,
            }} />
          </div>

          {/* Hero Image */}
          <HeroImage
          theme={theme}
          month={month}
          year={year}
          isMobile={isMobile}
          isCurrentMonth={month === today.getMonth() && year === today.getFullYear()}
          goMonth={goMonth}
          goToToday={goToToday}
            onShowMonthNotes={() => setShowMonthNotes(true)}
          />

          {/* Body: Calendar Grid Only */}
  <div style={{ width: "100%" }}>

            {/* Calendar Grid */}
            <CalendarGrid
              days={days}
              theme={theme}
              today={today}
              month={month}
              year={year}
              isMobile={isMobile}
              isCurrentMonth={isCurrentMonth}
              rangeStart={rangeStart}
              rangeStartNorm={rangeStartNorm}
              rangeEndNorm={rangeEndNorm}
              rangeDays={rangeDays}
              hoveredDate={hoveredDate}
              setHoveredDate={setHoveredDate}
              handleDayClick={handleDayClick}
              handleDayDoubleClick={handleDayDoubleClick}
              clearRange={clearRange}
              notes={notes}
              setFlipDir={setFlipDir}
              setIsFlipping={setIsFlipping}
              setCurDate={setCurDate}
            />

          </div>{/* end body grid */}

          {/* Bottom accent bar */}
          <div style={{
            height: 5,
            background: `linear-gradient(to right, ${theme.accentDark}, ${theme.accent}, ${theme.accentLight})`,
          }} />

        </div>{/* end main card */}

        {/* Footer hint */}
        <p style={{
          textAlign: "center",
          fontSize: 11.5,
          color: `${theme.accent}80`,
          marginTop: 14,
          letterSpacing: 0.3,
          fontStyle: "italic",
        }}>
          {theme.emoji} {theme.name} {year} · Click dates to select · Double-click to add notes · Auto-saved
        </p>
      </div>

      {/* ── Note Modal (Feature 1) ──────────────────────── */}
      <NoteModal
        isOpen={!!modalDate}
        date={modalDate}
        noteData={modalNoteData}
        onSave={saveModalNote}
        onDelete={(type) => handleDeleteEntry(modalNoteKey, type)}
        onClose={closeModal}
        theme={theme}
      />

      {/* ── Month Notes Modal (New Feature) ──────────────── */}
      <MonthNotesModal
        isOpen={showMonthNotes}
        onClose={() => setShowMonthNotes(false)}
        notes={notes}
        month={month}
        year={year}
        theme={theme}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
}