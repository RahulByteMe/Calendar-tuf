"use client";

import { useEffect, useRef } from "react";
import { fmtShort, toDateKey } from "../../utils/dateHelpers";

/**
 * MonthNotesModal — Displays a summary list of all notes for the current month.
 */
export default function MonthNotesModal({
  isOpen,
  onClose,
  notes,
  month,
  year,
  theme,
  onDelete,
}) {
  const modalRef = useRef(null);

  // Filter notes for the given month/year
  const monthPrefix = `day-${year}-${String(month + 1).padStart(2, '0')}`;
  
  const monthNotes = Object.entries(notes)
    .filter(([key, data]) => {
      if (!key.startsWith(monthPrefix)) return false;
      if (!data) return false;
      if (typeof data === "string") return data.trim().length > 0;
      // Filter out empty event/note objects
      return (
        (data.event && data.event.trim().length > 0) ||
        (data.note && data.note.trim().length > 0)
      );
    })
    .map(([key, data]) => {
      // Key is day-YYYY-MM-DD
      const dateStr = key.replace("day-", "");
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      
      // Normalize data for rendering
      let event = "";
      let note = "";
      let type = "note";
      
      if (typeof data === "string") {
        note = data;
      } else {
        event = data.event || "";
        note = data.note || "";
        type = data.type || "note";
      }
      
      return { date, dateStr, event, note, type };
    })
    .sort((a, b) => a.date - b.date);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Notes for ${theme.name} ${year}`}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(58, 53, 48, 0.4)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
        animation: "modalFadeIn 0.25s ease-out forwards",
      }}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
          animation: "modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          border: "1px solid #f0ece5",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 24px 16px",
          borderBottom: "1px solid #f8f6f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              fontFamily: "'Playfair Display', serif",
              color: "#3d3833",
            }}>
              {theme.name} {year}
            </h2>
            <p style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "#a09890",
              fontWeight: 700,
            }}>
              {monthNotes.length} {monthNotes.length === 1 ? "entry" : "entries"} found
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "#f5f3f0",
              border: "none",
              color: "#8d857d",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#ece9e4"}
            onMouseLeave={e => e.currentTarget.style.background = "#f5f3f0"}
          >
            ×
          </button>
        </div>

        {/* List Content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 0",
          background: "#fdfcfb",
        }}>
          {monthNotes.length > 0 ? (
            monthNotes.map((item, idx) => (
              <div
                key={item.dateStr}
                style={{
                  padding: "16px 24px",
                  borderBottom: idx === monthNotes.length - 1 ? "none" : "1px solid #f5f3f0",
                  display: "flex",
                  gap: 16,
                  animation: `fadeUp 0.3s ease-out forwards ${idx * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div style={{
                  minWidth: 50,
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: theme.accent,
                    marginBottom: 2,
                  }}>
                    {item.date.toLocaleDateString("default", { weekday: "short" })}
                  </div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#3d3833",
                    lineHeight: 1,
                  }}>
                    {item.date.getDate()}
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {item.event && (
                    <div style={{ position: "relative", paddingRight: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5,
                          background: "#fff5eb", color: "#d35400", padding: "3px 7px", borderRadius: 4,
                          border: "1px solid #ffcc80"
                        }}>Event</span>
                        <button
                          onClick={() => onDelete(`day-${item.dateStr}`, "event")}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 18, fontWeight: "bold", color: "#e53935", opacity: 0.4,
                            padding: "4px 8px", transition: "opacity 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                          title="Delete Event"
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ fontSize: 15, color: "#1a1a1a", marginTop: 6, fontWeight: 700 }}>{item.event}</div>
                    </div>
                  )}
                  {item.note && (
                    <div style={{ position: "relative", paddingRight: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5,
                          background: `${theme.accent}15`, color: theme.accent, padding: "3px 7px", borderRadius: 4,
                          border: `1px solid ${theme.accent}30`
                        }}>Note</span>
                        <button
                          onClick={() => onDelete(`day-${item.dateStr}`, "note")}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 18, fontWeight: "bold", color: "#e53935", opacity: 0.4,
                            padding: "4px 8px", transition: "opacity 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                          title="Delete Note"
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ fontSize: 15, color: "#1a1a1a", marginTop: 6, fontWeight: 600 }}>{item.note}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: "60px 24px",
              textAlign: "center",
              color: "#b8b0a6",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📓</div>
              <p style={{ fontSize: 13, fontStyle: "italic" }}>
                No notes found for this month.<br/>
                Double-click a day to add one!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          background: "#fff",
          borderTop: "1px solid #f5f3f0",
          textAlign: "center",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 32px",
              borderRadius: 12,
              background: theme.accent,
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${theme.accent}40`,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Done
          </button>
        </div>
      </div>
    </div>

  );
}
