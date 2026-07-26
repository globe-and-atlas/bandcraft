---
version: alpha
name: "bandcraft"
description: "Workshop dark-theme UI — override tokens below for project-specific identity."
colors:
  primary: "#5b8af7"
  background: "#080b12"
  surface: "#0e1220"
  surface-raised: "#151c2e"
  surface-overlay: "#1d2540"
  border: "#252e4a"
  border-strong: "#36416a"
  text: "#e6eaf4"
  text-secondary: "#8e9ab8"
  text-muted: "#58678e"
  accent-green: "#34d89a"
  accent-orange: "#f97c3c"
  accent-yellow: "#f5c842"
  accent-teal: "#38c9d4"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 900
    letterSpacing: -0.03em
    lineHeight: 1.15
  h2:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 800
    letterSpacing: -0.02em
  body:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 700
    letterSpacing: 0.07em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: 4px
  md: 6px
  lg: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
---

## Overview

Deep workshop aesthetic — a dark navy environment built for extended focus sessions.
The UI should feel like an instrumentation panel: precise, information-dense, low-distraction.
Primary interaction colour (`primary`) is reserved for links, active states, and calls to action only.
Everything else defers to the surface/border/text hierarchy.

Use this file as the single source of truth for visual decisions across any agent session.
When a design choice isn't covered here, default to restraint — add density rather than decoration.

## Colors

The palette is layered neutral darks with a single blue primary and optional accent colours.

- **Primary (#5b8af7):** Electric blue — interactive elements, active states, focus rings, links.
- **Background (#080b12):** Near-black navy — page canvas.
- **Surface / Surface-raised / Surface-overlay:** Three-step card elevation in ascending lightness.
- **Border / Border-strong:** Subtle separators; border-strong for focus or hover emphasis.
- **Text (#e6eaf4):** Primary readable content.
- **Text-secondary (#8e9ab8):** Labels, metadata, secondary copy.
- **Text-muted (#58678e):** Placeholder text, disabled states, timestamps.
- **Accent colours:** Green = success/live, Orange = warning/effort, Yellow = highlight, Teal = data/signal. Use sparingly — one accent per component maximum.

## Typography

Two families: **Inter** (UI text, all weights) and **JetBrains Mono** (code, terminal output, monospaced data).
Font weights communicate hierarchy — 900 for page titles, 800 for section headers, 700 for labels and emphasis, 400 for body.
Labels always use uppercase with expanded letter-spacing (`label` scale).
Never use font size alone to indicate importance; pair it with weight.

## Layout & Spacing

4px base grid. All spacing values are multiples of 4px.
Cards and panels use `surface` background with `border` colour at `rounded.md`.
Page content max-width: 1200px, centred with `spacing.xl` horizontal padding.
Dense information layouts preferred over sparse ones — avoid large empty areas.

## Components

Components inherit the token system above. Key conventions:

- **Buttons:** `primary` background, `text` colour, `rounded.md`, `spacing.sm` vertical padding.
- **Cards:** `surface` background, 1px `border`, `rounded.md`, `spacing.md` padding.
- **Inputs:** `surface-raised` background, `border` outline, focus ring in `primary` at 50% opacity.
- **Status badges:** Pill shape (`rounded.full`), small `label` type, coloured background at 12% opacity with matching solid text.
- **Code blocks:** `surface` background, `border` outline, `rounded.md`, `mono` typography, `accent-green` text.

## Do's and Don'ts

**Do:**
- Use the surface stack (background → surface → surface-raised → surface-overlay) for elevation.
- Reserve `primary` exclusively for interactive affordances.
- Use `mono` typography for all technical values, commands, and data identifiers.
- Apply `label` scale (uppercase, tracked) for section headings and metadata tags.

**Don't:**
- Use more than one accent colour in the same component.
- Add decorative gradients or shadows not derived from the elevation system.
- Use font sizes below 11px.
- Introduce new colours outside the token set without updating this file first.
