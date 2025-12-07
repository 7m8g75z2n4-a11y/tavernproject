# Tavern

**Tavern** is a cozy, premium companion app for tabletop RPGs – a home between campaigns where your characters gather, rest, and continue their stories.

> _“Where your characters gather.”_

---

## ✨ Current Features (UI-Only Prototype)

This repo currently implements a design-first prototype using **mock data** and **static routes**:

### Landing Page (`/`)
- Hero marketing screen with:
  - **TAVERN** logo and tagline: “Where your characters gather.”
  - Parchment-style hero card with illustration placeholder.
  - Copy explaining Tavern as a home between campaigns.
  - Primary and secondary CTAs (Create Account, Explore Demo).

### Auth Screen (`/auth`)
- Tavern-themed authentication panel:
  - **Create Account** section (email + password, Enter button).
  - **Sign In** section (email + password, “Continue with Google” button).
  - Decorative divider, lantern glow, and narrative footnote.
- UI only – no real auth wiring yet.

### Dashboard (`/dashboard`)
- Top tab strip: **Characters / Campaigns / Settings** (visual only).
- **Your Characters** panel:
  - Mock character cards on parchment.
  - “+ Add Character” CTA and “Open Sheet” per card.
- **Your Campaigns** panel:
  - Mock campaigns with role/schedule.
  - “Host a Campaign” CTA and “Open Campaign” per card.
- Fully themed to match the tavern aesthetic.

### Character Sheet (`/characters/[id]`)
- Two-column layout:
  - **Left:** Parchment character sheet.
    - Name, subtitle, HP/AC/Speed badges.
    - Tabs: **Overview / Stats / Inventory** with stateful switching.
    - Overview story text, features list.
    - Stats grid (STR/DEX/CON/INT/WIS/CHA).
    - Inventory list.
  - **Right:** Portrait / future 3D placeholder orb with caption.
- Uses mock character data with ID-based lookup.

---

## 🧱 Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Language:** TypeScript / React
- **Styling:** Global CSS with a custom Tavern design system:
  - CSS variables for colors, typography, shadows.
  - Shared layout utilities for the tavern frame.
  - Themed components (parchment cards, lantern glows, tabs, etc.).

Planned future additions:

- **State & Data:** real persistence layer (DB or API).
- **3D:** React Three Fiber + Drei for in-tavern character renders.
- **Auth:** real authentication provider.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

### Install dependencies

```bash
npm install
# or
yarn install
```

### Run the dev server

```bash
npm run dev
# or
yarn dev
```

Visit:

- http://localhost:3000 – Landing
- http://localhost:3000/auth – Auth screen
- http://localhost:3000/dashboard – Dashboard
- http://localhost:3000/characters/1 – Character Sheet (mock)

---

## 🧭 Project Structure (high level)

```
app/
  layout.tsx           # Global tavern frame (header, background)
  page.tsx             # Landing page
  auth/
    page.tsx           # Auth screen
  dashboard/
    page.tsx           # Dashboard (characters + campaigns)
  characters/
    [id]/
      page.tsx         # Character Sheet (mock data, tabbed)
styles/
  globals.css          # Design system + page-level styles
```

Mock data is currently defined inside the relevant pages (to be centralized later).

---

## 🗺️ Roadmap

Planned milestones:

- Session Panel UI – track XP, HP changes, gold, conditions, and notes.
- Campaign / Party Page – party members, invite link, schedule.
- Character Creation Flow – wizard for creating new heroes.
- 3D Integration – render characters in a tavern orb using React Three Fiber.
- Real Backend / State – connect to a database and real auth.

---

## 🤝 Contributing / Branching

Suggested flow:

Create a feature branch:

```bash
git checkout -b feature/session-panel
```

Commit changes:

```bash
git add .
git commit -m "Add Session Panel layout"
```

Push and open a PR:

```bash
git push -u origin feature/session-panel
```

---

## 📜 License

TBD – choose a license when you’re ready to open-source or share.
