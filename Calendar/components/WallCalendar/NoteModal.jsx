"use client";

import { useState, useEffect, useRef } from "react";

export default function NoteModal({ isOpen, date, noteData, onSave, onClose, theme }) {
  const [eventText, setEventText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [type, setType] = useState("note");
  const textareaRef = useRef(null);
  const modalRef = useRef(null);
  const MAX_CHARS = 500;

  // Initialize from existing note data
  useEffect(() => {
    if (isOpen && noteData) {
      setEventText(noteData.event || "");
      setNoteText(noteData.note || "");
      setType(noteData.type || "note");
    } else if (isOpen) {
      setEventText("");
      setNoteText("");
      setType("note");
    }
  }, [isOpen, noteData]);

  // Autofocus textarea
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // ESC to close + Ctrl+Enter to save
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Focus trapping inside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll(
      'button, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    modal.addEventListener("keydown", trap);
    return () => modal.removeEventListener("keydown", trap);
  }, [isOpen]);

  function handleSave() {
    onSave(eventText, noteText, type);
    onClose();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!isOpen || !date) return null;

  const dateStr = date.toLocaleDateString("default", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Note for ${dateStr}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        animation: "modalFadeIn 0.22s ease",
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(420px, 90vw)",
          boxShadow: `0 24px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)`,
          animation: "modalScaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div style={{
          padding: "20px 24px 14px",
          borderBottom: "1px solid #f0ece5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
              color: theme.accent, textTransform: "uppercase", marginBottom: 4,
            }}>
              {noteData?.note ? "Edit Note" : "New Note"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#2a2520" }}>
              {dateStr}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "#f5f2ee", border: "none", borderRadius: 8,
              width: 30, height: 30, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#a09890",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#ede8e2"}
            onMouseLeave={e => e.currentTarget.style.background = "#f5f2ee"}
          >
            ✕
          </button>
        </div>

        {/* ── Type Tabs ─────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 2,
          padding: "14px 24px 0",
        }}>
          {[
            { id: "event", label: "📅 Event" },
            { id: "note", label: "📝 Note" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id)}
              aria-pressed={type === tab.id}
              tabIndex={0}
              style={{
                flex: 1,
                padding: "9px 14px",
                border: type === tab.id ? `1.5px solid ${theme.accent}30` : "1.5px solid transparent",
                borderRadius: 10,
                background: type === tab.id ? theme.accentLight : "#f8f6f3",
                color: type === tab.id ? theme.accent : "#a09890",
                fontSize: 13,
                fontWeight: type === tab.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.18s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Textarea ──────────────────────────────────── */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{
            position: "relative",
            background: "#faf8f5",
            borderRadius: 12,
            border: `1.5px solid ${theme.accent}25`,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}>
            <textarea
              ref={textareaRef}
              value={type === "event" ? eventText : noteText}
              onChange={e => {
                if (e.target.value.length <= MAX_CHARS) {
                  if (type === "event") setEventText(e.target.value);
                  else setNoteText(e.target.value);
                }
              }}
              placeholder={type === "event" ? "Describe your event…" : "Write your note…"}
              aria-label={type === "event" ? "Event description" : "Note content"}
              rows={5}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "none", background: "transparent",
                resize: "none", fontSize: 14,
                color: "#3a3530", lineHeight: 1.65,
                padding: "14px 16px 28px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                minHeight: 130,
              }}
              onFocus={e => {
                e.target.parentElement.style.borderColor = `${theme.accent}60`;
                e.target.parentElement.style.boxShadow = `0 0 0 3px ${theme.accent}12`;
              }}
              onBlur={e => {
                e.target.parentElement.style.borderColor = `${theme.accent}25`;
                e.target.parentElement.style.boxShadow = "none";
              }}
            />
            {/* Character counter */}
            <div style={{
              position: "absolute", bottom: 10, right: 14,
              fontSize: 11, fontWeight: 500,
              color: (type === "event" ? eventText : noteText).length > MAX_CHARS * 0.9 ? "#e53935" :
                     (type === "event" ? eventText : noteText).length > MAX_CHARS * 0.75 ? "#ff9800" : "#c5c0ba",
              transition: "color 0.2s",
            }}>
              {(type === "event" ? eventText : noteText).length}/{MAX_CHARS}
            </div>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 24px 20px",
        }}>
          <span style={{ fontSize: 10.5, color: "#c5bfb8", letterSpacing: 0.3 }}>
            {navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter to save
          </span>
          <div style={{ display: "flex", gap: 10, flex: 1, justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                aria-label="Cancel"
                style={{
                  padding: "9px 20px",
                  border: "1px solid #e5e0d8",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#8a8580",
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f8f6f3"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                aria-label="Save note"
                style={{
                  padding: "9px 24px",
                  border: "none",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                  color: "#fff",
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 3px 14px ${theme.accent}35`,
                  transition: "all 0.15s ease, transform 0.1s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = `0 5px 20px ${theme.accent}45`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 3px 14px ${theme.accent}35`;
                }}
                onMouseDown={e => e.currentTarget.style.transform = "translateY(0) scale(0.97)"}
                onMouseUp={e => e.currentTarget.style.transform = "translateY(-1px) scale(1)"}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
