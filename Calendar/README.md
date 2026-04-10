# 🗓️ TUF Calendar — Premium Interactive Wall Calendar

**TUF Calendar** is a highly polished, interactive wall-style calendar component built with **Next.js** and **React**. It features a modular, scalable architecture and a sophisticated "Double-Click to Note" interaction model.

Designed with a focus on "Rich Aesthetics" and "Visual Excellence," it transitions beautifully between months using AI-generated photography and adaptive seasonal themes.

---

## ✨ Key Features

- **Double-Click Workflow**: A modern, Apple Calendar-inspired modal for managing plans.
- **Dual-Category Content**: Separate storage for **Events** and **Notes** on the same day—no more overwriting.
- **Dynamic Seasonal Themes**: Every month features unique accent colors, gradients, and imagery (AI-generated + high-res Unsplash).
- **Monthly Summary Modal**: A dedicated list view to see all events and notes for the currently viewed month at a glance.
- **Dual-Indicator Dots**: Visual cues on the calendar grid differentiating between events (Orange) and general notes (Theme-color).
- **Responsive 3D Flip**: Cinematic perspective transitions when navigating between months.
- **No External Dependencies**: Built using pure vanilla CSS (inline styles) and native React state—zero library bloat.
- **Persistence**: Fully auto-saves your entries to `localStorage`, surviving page refreshes.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React](https://reactjs.org/) (Hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `memo`)
- **Styling**: Vanilla Inline CSS for maximum portability and dynamic theme mapping.
- **Typography**: Playfair Display (Headings) & DM Sans (Body) via Google Fonts.

---

## 📂 Project Structure

The project follows a modular architecture for maintainability:

```text
src/
├── components/
│   └── WallCalendar/
│       ├── WallCalendar.jsx      # Root Orchestrator
│       ├── CalendarGrid.jsx      # Grid Layout & Navigation
│       ├── DayCell.jsx           # Individual Date Rendering
│       ├── HeroImage.jsx         # Seasonal Banner & Nav Badge
│       ├── NoteModal.jsx         # The "Double-Click" editor
│       ├── MonthNotesModal.jsx   # Monthly Summary List
│       ├── SpiralRings.jsx       # Decorative Binding
│       ├── RangeInfo.jsx         # Selection Details
│       └── TimelineView.jsx      # Future extension point
└── utils/
    ├── dateHelpers.js            # Precise Date manipulation
    └── monthThemes.js            # Configuration for all 12 months
```

---

## 🚀 Getting Started

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open at**: [http://localhost:3000](http://localhost:3000)

---

## 🏗 Data Structure

Notes are stored in a structured object format to support categorization:

```typescript
{
  [dateKey: string]: {
    event: string;     // Dedicated event description
    note: string;      // Detailed day note
    type: "event" | "note"; // Last used tab
    createdAt: number; // Timestamp
  }
}
```

---

## 🎨 Customizing Themes

You can easily modify the look and feel of each month in `src/utils/monthThemes.js`. Each theme object supports:
- `name`: Month title
- `img`: Hero image path or URL
- `accent`: Primary color for buttons and indicators
- `accentLight`: Subtle backgrounds for ranges/hovers
- `gradient`: Background gradient for the entire portal

---

## 🤝 Contributing

This project is built with clean, modular principles. Developers are encouraged to:
- Extend the `TimelineView` for horizontal scheduling.
- Add holiday configurations for specific locales in `monthThemes.js`.
- Optimize image loading with Next.js Image component (currently using native standard tags for maximum portability).

---

**Built with ❤️ for Visual Excellence.**
