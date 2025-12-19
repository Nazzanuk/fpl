# FPL Live Design System

A comprehensive design specification for the FPL Live application, inspired by premium sports TV broadcasting graphics. This document details every aspect of the visual language, from color palettes to typography, spacing systems, and component patterns.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Motion & Animation](#motion--animation)
7. [Iconography](#iconography)
8. [Data Visualization](#data-visualization)
9. [Responsive Behavior](#responsive-behavior)
10. [Do's and Don'ts](#dos-and-donts)

---

## Design Philosophy

### Core Principles

**1. Broadcast Quality**
The design draws direct inspiration from premium sports TV graphics—think Sky Sports, ESPN, or NBC Sports. Every element should feel like it belongs on a live broadcast overlay, communicating authority, precision, and real-time urgency.

**2. Information Density Without Clutter**
Sports data is inherently dense. The design embraces this by presenting maximum information in minimum space, using visual hierarchy and subtle separators rather than excessive whitespace.

**3. Sharp & Precise**
No rounded corners. Every edge is intentional and sharp, conveying precision and professionalism. This isn't a friendly consumer app—it's a serious tool for serious FPL managers.

**4. Light Mode with Dark Accents**
The primary interface is light (white/off-white surfaces) for readability, but dark navy elements provide contrast, anchor points, and visual weight. Gold accents add premium feel without overwhelming.

**5. Real-Time Feel**
Visual cues should constantly remind users this is live data. Pulsing indicators, live badges, and dynamic elements maintain the sense of an active broadcast.

---

## Color System

### Primary Palette

```css
/* Deep Navy - Primary dark color */
--ink: #0a0f1c;           /* Headers, badges, emphasis */
--ink-light: #141d2e;     /* Secondary dark surfaces */
--ink-lighter: #1e2a3d;   /* Tertiary dark, borders on dark */

/* Premium Gold - Accent color */
--gold: #d4af37;          /* Primary accent, highlights */
--gold-light: #e5c76b;    /* Hover states, secondary accent */
--gold-dark: #b8962e;     /* Text on light backgrounds */
```

### Surface Colors

```css
/* Light Surfaces */
--surface: #ffffff;       /* Primary content background */
--surface-dim: #f7f8fa;   /* Page background, recessed areas */
--surface-muted: #eef0f4; /* Subtle differentiation, hover states */
```

### Text Colors

```css
--text: #0a0f1c;          /* Primary text (matches --ink) */
--text-secondary: #4a5568; /* Secondary information */
--text-muted: #718096;    /* Tertiary, labels, hints */
```

### Semantic Colors

```css
--border: #e2e6ec;        /* Default borders */
--live: #dc2626;          /* Live indicators, urgent */
--positive: #059669;      /* Gains, improvements, green arrows */
--negative: #dc2626;      /* Losses, drops, red indicators */
```

### Color Usage Guidelines

| Element | Color | Usage |
|---------|-------|-------|
| Page background | `--surface-dim` | Base layer |
| Content cards | `--surface` | Primary content areas |
| Headers/Navigation | `--ink` | Top-level navigation, section headers |
| Primary accent | `--gold` | CTAs, active states, highlights |
| Live indicators | `--live` | Pulsing dots, live badges |
| Position up | `--positive` | Green arrows, gains |
| Position down | `--negative` | Red arrows, losses |

### Color Relationships

**Dark on Light:**
- `--ink` text on `--surface` backgrounds
- `--gold-dark` for gold text on light backgrounds (better contrast)

**Light on Dark:**
- White text on `--ink` backgrounds
- `--gold` for accents on dark backgrounds (full vibrancy)

---

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

The system font stack ensures optimal rendering on each platform while maintaining a clean, modern appearance consistent with broadcast graphics.

### Type Scale

```css
/* Display */
--text-4xl: 3.25rem;    /* 52px - Hero headlines */
--text-3xl: 2.5rem;     /* 40px - Page titles */
--text-2xl: 2rem;       /* 32px - Section headers */
--text-xl: 1.75rem;     /* 28px - Large numbers, stats */

/* Body */
--text-lg: 1.375rem;    /* 22px - Manager names, emphasis */
--text-base: 1.125rem;  /* 18px - Primary content */
--text-md: 1rem;        /* 16px - Secondary content */
--text-sm: 0.9375rem;   /* 15px - Supporting text */

/* Small */
--text-xs: 0.875rem;    /* 14px - Table content */
--text-2xs: 0.8125rem;  /* 13px - Compact data */
--text-3xs: 0.75rem;    /* 12px - Labels */
--text-4xs: 0.6875rem;  /* 11px - Micro labels */
--text-5xs: 0.625rem;   /* 10px - Badges, tags */
--text-6xs: 0.5625rem;  /* 9px - Tiny labels */
```

### Font Weights

```css
--font-regular: 400;    /* Body text, descriptions */
--font-medium: 500;     /* Slightly emphasized text */
--font-semibold: 600;   /* Labels, secondary headers */
--font-bold: 700;       /* Names, important data */
--font-extrabold: 800;  /* Headlines, large numbers, emphasis */
```

### Weight Usage

| Weight | Use Case |
|--------|----------|
| 400 | Body paragraphs, descriptions, hints |
| 500 | Player names in lists, secondary info |
| 600 | Section labels, table headers, badges |
| 700 | Manager names, player names (emphasis), stats |
| 800 | Headlines, large point totals, brand text, rankings |

### Letter Spacing

```css
--tracking-tighter: -0.03em;  /* Large headlines */
--tracking-tight: -0.02em;    /* Section headers */
--tracking-normal: -0.01em;   /* Body text */
--tracking-wide: 0.04em;      /* Uppercase labels */
--tracking-wider: 0.08em;     /* Small uppercase text */
--tracking-widest: 0.12em;    /* Tiny badges, micro labels */
```

### Text Transforms

**Uppercase Usage:**
- Navigation labels
- Section headers (small)
- Status badges
- Team abbreviations
- Position labels (GK, DEF, MID, FWD)
- "LIVE" indicators

**Sentence Case:**
- Headlines
- Manager names
- Player names
- Button text

### Numeric Typography

```css
font-feature-settings: "tnum";  /* Tabular numbers */
```

Always use tabular (monospace) numbers for:
- Points totals
- Rankings/positions
- Percentages
- Any numeric data that appears in columns

This ensures numbers align vertically in tables and maintain consistent width during live updates.

### Line Heights

```css
--leading-none: 1;        /* Large display numbers */
--leading-tight: 1.1;     /* Headlines */
--leading-snug: 1.25;     /* Subheadings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.6;   /* Long-form descriptions */
```

---

## Spacing & Layout

### Spacing Scale

```css
--space-0: 0;
--space-px: 1px;
--space-0.5: 0.125rem;   /* 2px */
--space-1: 0.25rem;      /* 4px */
--space-1.5: 0.375rem;   /* 6px */
--space-2: 0.5rem;       /* 8px */
--space-2.5: 0.625rem;   /* 10px */
--space-3: 0.75rem;      /* 12px */
--space-3.5: 0.875rem;   /* 14px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
```

### Border Radius

```css
--radius: 0;  /* Sharp corners throughout */
```

**No border radius is used anywhere in the design.** This is a core principle—every element has sharp, precise corners that communicate professionalism and broadcast-quality aesthetics.

### Border Widths

```css
--border-default: 1px;   /* Standard borders */
--border-thick: 2px;     /* Emphasis, hover states */
--border-accent: 3px;    /* Section indicators, left borders */
```

### Layout Patterns

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (--ink background, gold accent bar below)        │
├─────────────────────────────────────────────────────────┤
│ TICKER (horizontal scrolling match scores)              │
├───────────────────────────┬─────────────────────────────┤
│                           │                             │
│  STANDINGS LIST           │  DETAIL PANEL               │
│  (left column)            │  (right column)             │
│                           │                             │
│  - Scrollable             │  - Contextual content       │
│  - Fixed width or flex    │  - Manager details          │
│                           │  - H2H comparison           │
│                           │  - Differentials            │
│                           │                             │
├───────────────────────────┴─────────────────────────────┤
│ QUICK ACTIONS (tab navigation)                          │
└─────────────────────────────────────────────────────────┘
```

**Card Spacing:**
- Card padding: `1rem` to `1.5rem`
- Card margins: `1rem`
- Internal element spacing: `0.5rem` to `0.75rem`

**Section Separation:**
- Use `1px solid var(--border)` for light separation
- Use `gap: 1px` with `background: var(--border)` for seamless dividers
- Use `border-bottom: 3px solid var(--gold)` for emphasis

---

## Component Patterns

### Headers

**Primary Header (Dark):**
```css
.header {
  background: var(--ink);
  border-bottom: 3px solid var(--gold);
  padding: 1rem 1.5rem;
}
```

**Section Header:**
```css
.sectionHeader {
  padding: 0.625rem 0.875rem;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
}

.sectionTitle {
  font-size: 0.625rem;      /* 10px */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}
```

### Badges

**Rank Badge:**
```css
.rankBadge {
  background: var(--ink);
  color: white;
  padding: 1rem 1.5rem;
  text-align: center;
}

.rankValue {
  font-size: 2rem;
  font-weight: 800;
  font-feature-settings: "tnum";
}

.rankLabel {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold);
}
```

**Status Badge:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Variants */
.badgeGold {
  background: var(--gold);
  color: var(--ink);
}

.badgeDark {
  background: var(--ink);
  color: white;
}

.badgeLive {
  background: var(--live);
  color: white;
}
```

### Cards

**Manager Card:**
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  /* No border-radius */
}

.cardHeader {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.cardBody {
  padding: 1rem 1.5rem;
}
```

**Clickable Card:**
```css
.clickableCard {
  cursor: pointer;
  transition: background 0.15s ease;
}

.clickableCard:hover {
  background: var(--surface-muted);
}

/* Optional gold accent on hover */
.clickableCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gold);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.clickableCard:hover::before {
  transform: scaleX(1);
}
```

### Tables

**Standings Table:**
```css
.table {
  display: flex;
  flex-direction: column;
}

.tableHeader {
  display: grid;
  grid-template-columns: 3rem 1fr 5rem 5rem;
  padding: 0.625rem 1rem;
  background: var(--ink);
  color: white;
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.tableRow {
  display: grid;
  grid-template-columns: 3rem 1fr 5rem 5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--surface-muted);
  cursor: pointer;
  transition: background 0.1s;
}

.tableRow:hover {
  background: var(--surface-muted);
}

.tableRowSelected {
  background: var(--surface-muted);
  border-left: 3px solid var(--gold);
}
```

### Buttons

**Primary Button:**
```css
.button {
  padding: 1rem 1.75rem;
  background: var(--gold);
  color: var(--ink);
  border: none;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.15s ease;
}

.button:hover {
  background: var(--gold-light);
}
```

**Secondary Button:**
```css
.buttonSecondary {
  padding: 0.75rem 1.25rem;
  background: var(--ink);
  color: white;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.buttonSecondary:hover {
  background: var(--ink-light);
}
```

**Tab Button:**
```css
.tab {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
}

.tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gold);
  transform: scaleX(0);
  transition: transform 0.15s ease;
}

.tabActive {
  color: var(--text);
  font-weight: 700;
}

.tabActive::after {
  transform: scaleX(1);
}
```

### Form Elements

**Input Field:**
```css
.input {
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid var(--border);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text);
  /* No border-radius */
}

.input:focus {
  outline: none;
  border-color: var(--gold);
}

.input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}
```

**Select Dropdown:**
```css
.select {
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  background: var(--ink-light);
  border: 1px solid var(--ink-lighter);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  appearance: none;
  cursor: pointer;

  /* Custom dropdown arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
}

.select:focus {
  outline: none;
  border-color: var(--gold);
}
```

### Indicators

**Live Indicator:**
```css
.liveIndicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--live);
}

.liveDot {
  width: 6px;
  height: 6px;
  background: var(--live);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

**Movement Indicator:**
```css
.movement {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 700;
}

.movementUp {
  color: var(--positive);
}

.movementUp::before {
  content: '▲';
  font-size: 0.5rem;
}

.movementDown {
  color: var(--negative);
}

.movementDown::before {
  content: '▼';
  font-size: 0.5rem;
}
```

**Captain Badge:**
```css
.captainBadge {
  width: 1.125rem;
  height: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gold);
  color: var(--ink);
  font-size: 0.5625rem;
  font-weight: 800;
}

.viceCaptainBadge {
  background: var(--ink-lighter);
  color: white;
}
```

### Progress Bars

**Ownership Bar:**
```css
.progressBar {
  height: 3px;
  background: var(--surface-muted);
  position: relative;
}

.progressFill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--ink);
  transition: width 0.3s ease;
}
```

---

## Motion & Animation

### Timing Functions

```css
--ease-default: ease;
--ease-in: ease-in;
--ease-out: ease-out;
--ease-in-out: ease-in-out;
```

### Duration Scale

```css
--duration-fast: 0.1s;      /* Micro-interactions */
--duration-default: 0.15s;  /* Standard transitions */
--duration-slow: 0.2s;      /* Emphasis transitions */
--duration-slower: 0.3s;    /* Complex animations */
```

### Standard Transitions

**Hover States:**
```css
transition: background 0.15s ease;
transition: color 0.15s ease;
transition: border-color 0.15s ease;
transition: transform 0.15s ease;
```

**Transform Effects:**
```css
/* Lift on hover */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Scale reveal */
.indicator::before {
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.indicator:hover::before {
  transform: scaleX(1);
}
```

### Animations

**Pulse (Live Indicator):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.liveDot {
  animation: pulse 2s infinite;
}
```

**Shimmer (Loading):**
```css
@keyframes shimmer {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.skeleton {
  animation: shimmer 1.5s infinite;
}
```

**Ticker Scroll:**
```css
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.tickerContent {
  animation: ticker 30s linear infinite;
}

.tickerContent:hover {
  animation-play-state: paused;
}
```

---

## Iconography

### Icon Style

Icons should be:
- Simple and geometric
- Single color (inherits from parent)
- Sharp corners (no rounded caps)
- 1-2px stroke weight

### Numeric Icons

For feature sections, use numeric indicators instead of traditional icons:

```css
.featureIcon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.6875rem;
  font-weight: 800;
  color: var(--gold);
}

/* Content: "01", "02", "03", "04" */
```

### Arrow Indicators

```css
/* Up Arrow */
.arrowUp::before {
  content: '▲';
  font-size: 0.5rem;
}

/* Down Arrow */
.arrowDown::before {
  content: '▼';
  font-size: 0.5rem;
}
```

### Badge Icons

Single-character badges (C for Captain, V for Vice-Captain) use the badge pattern with appropriate background colors.

---

## Data Visualization

### Color Coding

**Ownership Tiers:**
| Tier | Ownership | Color |
|------|-----------|-------|
| Essential | 75%+ | `var(--negative)` #dc2626 |
| Popular | 50-74% | `#f97316` (orange) |
| Moderate | 25-49% | `var(--gold)` |
| Differential | <25% | `var(--positive)` |

**Performance:**
| Status | Color |
|--------|-------|
| Positive/Gain | `var(--positive)` #059669 |
| Negative/Loss | `var(--negative)` #dc2626 |
| Neutral | `var(--text-muted)` |

### Left Border Indicators

Use 3px left borders to indicate category or status:

```css
.item {
  border-left: 3px solid var(--border);
}

.itemPositive {
  border-left-color: var(--positive);
}

.itemNegative {
  border-left-color: var(--negative);
}

.itemSelected {
  border-left-color: var(--gold);
}
```

### Match Score Display

```css
.score {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.scoreValue {
  font-size: 0.875rem;
  font-weight: 800;
  font-feature-settings: "tnum";
  min-width: 1.25rem;
  text-align: center;
}

.scoreDivider {
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Live match - red center */
.scoreLive .scoreDivider {
  background: var(--live);
  color: white;
  padding: 0.125rem 0.25rem;
}
```

---

## Responsive Behavior

### Breakpoints

```css
--breakpoint-sm: 480px;
--breakpoint-md: 768px;
--breakpoint-lg: 900px;
--breakpoint-xl: 1200px;
```

### Layout Adaptations

**Desktop (>900px):**
- Two-column dashboard layout
- Full feature grid (4 columns)
- Expanded data tables

**Tablet (768px - 900px):**
- Two-column dashboard maintained
- Feature grid: 2 columns
- Condensed padding

**Mobile (<768px):**
- Single column layout
- Stacked dashboard panels
- Feature grid: 1 column
- Touch-optimized tap targets (minimum 44px)

### Typography Scaling

```css
@media (max-width: 900px) {
  .heroTitle {
    font-size: 2.5rem;  /* Down from 3.25rem */
  }
}

@media (max-width: 480px) {
  .heroTitle {
    font-size: 2rem;    /* Down from 2.5rem */
  }
}
```

### Table Adaptations

On smaller screens, tables may:
- Hide less critical columns
- Switch to card-based layouts
- Use horizontal scrolling for data-dense views

---

## Do's and Don'ts

### Do's

✓ **Use tabular numbers** for all numeric data
```css
font-feature-settings: "tnum";
```

✓ **Maintain sharp corners** throughout—no border-radius anywhere

✓ **Use uppercase sparingly** but consistently for labels and navigation

✓ **Apply gold accents** for interactive elements and key highlights

✓ **Use the dark header pattern** for primary navigation and section headers

✓ **Implement hover states** on all interactive elements

✓ **Use left border indicators** to show selection or category

✓ **Keep text contrast high**—dark text on light, light text on dark

✓ **Use semantic colors consistently**—green for positive, red for negative

✓ **Apply consistent spacing**—use the spacing scale, don't invent values

### Don'ts

✗ **Don't use rounded corners**—ever

✗ **Don't use shadows excessively**—only subtle shadows on elevated elements

✗ **Don't mix gold with other accent colors**—gold is the sole accent

✗ **Don't use thin fonts**—minimum weight is 400, prefer 600+ for UI

✗ **Don't center-align body text**—left-align for readability

✗ **Don't use pure black** (#000)—use `--ink` (#0a0f1c) instead

✗ **Don't forget tabular numbers** in tables and statistics

✗ **Don't make touch targets too small**—minimum 44px on mobile

✗ **Don't animate everything**—motion should be purposeful

✗ **Don't use colored backgrounds for cards**—keep them white/surface

---

## CSS Custom Properties Reference

```css
:root {
  /* Colors - Primary */
  --ink: #0a0f1c;
  --ink-light: #141d2e;
  --ink-lighter: #1e2a3d;

  /* Colors - Accent */
  --gold: #d4af37;
  --gold-light: #e5c76b;
  --gold-dark: #b8962e;

  /* Colors - Surface */
  --surface: #ffffff;
  --surface-dim: #f7f8fa;
  --surface-muted: #eef0f4;

  /* Colors - Text */
  --text: #0a0f1c;
  --text-secondary: #4a5568;
  --text-muted: #718096;

  /* Colors - Semantic */
  --border: #e2e6ec;
  --live: #dc2626;
  --positive: #059669;
  --negative: #dc2626;

  /* Layout */
  --radius: 0;

  /* Typography */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2024 | Initial design system documentation |

---

*This design system is inspired by premium sports broadcasting graphics and is specifically tailored for the FPL Live application. All patterns and specifications should be followed consistently to maintain visual coherence across the application.*
