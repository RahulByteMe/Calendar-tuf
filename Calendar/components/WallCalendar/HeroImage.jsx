"use client";
import { useState } from "react";


/* Nav arrow button style helper */
function navBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: side === "left" ? 14 : 14,
    background: "rgba(0,0,0,0.28)",
    backdropFilter: "blur(6px)",
    border: "1.5px solid rgba(255,255,255,0.22)",
    color: "#fff",
    width: 40, height: 40,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    lineHeight: 1,
    transition: "background 0.15s ease, transform 0.15s ease",
    fontFamily: "sans-serif",
  };
}

export default function HeroImage({ theme, month, year, isMobile, isCurrentMonth, goMonth, goToToday, onShowMonthNotes }) {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const isLoaded = loadedSrc === theme.img;

  return (
    <div style={{
      position: "relative",
      height: isMobile ? 220 : 300,
      backgroundColor: theme.accentDark,
      backgroundImage: isLoaded 
        ? "none" 
        : `linear-gradient(90deg, ${theme.accentDark} 0%, ${theme.accent} 40%, ${theme.accentDark} 80%)`,
      backgroundSize: "200% auto",
      animation: isLoaded ? "none" : "shimmer 2.5s infinite linear",
      overflow: "hidden",
    }}>
      <img
        key={`${month}-${year}`}
        src={theme.img}
        alt={`${theme.name} - ${theme.label}`}
        onLoad={() => setLoadedSrc(theme.img)}
        onError={() => setLoadedSrc(theme.img)}
        ref={(img) => {
          if (img && img.complete) {
            setLoadedSrc(theme.img);
          }
        }}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
          display: "block",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.6s ease",
          filter: "brightness(0.82) saturate(1.08)",
        }}
      />

      {/* gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(
          to bottom,
          ${theme.accentDark}22 0%,
          transparent 40%,
          ${theme.accentDark}88 100%
        )`,
      }} />

      {/* top pill label */}
      <div style={{
        position: "absolute", top: isMobile ? 14 : 20, left: isMobile ? 14 : 20,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 24,
        padding: "5px 14px",
        display: "flex", alignItems: "center", gap: 6,
        fontSize: isMobile ? 10 : 11,
        color: "rgba(255,255,255,0.92)",
        letterSpacing: 1.4,
        fontWeight: 500,
        textTransform: "uppercase",
      }}>
        <span>{theme.emoji}</span>
        {theme.label}
      </div>

      {/* keyboard hint (desktop) */}
      {!isMobile && (
        <div style={{
          position: "absolute", top: 20, right: 20,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          borderRadius: 8,
          padding: "4px 10px",
          fontSize: 10,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: 0.5,
        }}>
          ← → keys to navigate
        </div>
      )}

      {/* nav arrows */}
      <button
        id="prev-month-btn"
        onClick={() => goMonth(-1)}
        aria-label="Previous month"
        style={navBtnStyle("left")}
      >
        ‹
      </button>
      <button
        id="next-month-btn"
        onClick={() => goMonth(1)}
        aria-label="Next month"
        style={navBtnStyle("right")}
      >
        ›
      </button>

      {/* Month + Year badge (bottom right) */}
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        background: theme.accent,
        padding: isMobile ? "10px 18px" : "14px 28px",
        textAlign: "right",
        boxShadow: "-4px -4px 20px rgba(0,0,0,0.15)",
      }}>
        <div style={{
          fontSize: isMobile ? 10 : 11,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: 3,
          fontWeight: 300,
        }}>
          {year}
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? 24 : 32,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 1,
          lineHeight: 1.1,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "flex-end",
        }}>
          {theme.name}
          <button
            onClick={onShowMonthNotes}
            title={`View all notes for ${theme.name}`}
            style={{
              width: 30, height: 30,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = theme.accent;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "#fff";
            }}
          >
            📋
          </button>
        </div>
        {!isCurrentMonth && (
          <button
            id="go-to-today-btn"
            onClick={goToToday}
            style={{
              marginTop: 6,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 12,
              padding: "2px 10px",
              fontSize: 10,
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            Go to today
          </button>
        )}
      </div>
    </div>
  );
}
