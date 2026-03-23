# DentiVerse Design System

> Version 1.0 — March 2026

## Overview

This design system defines the visual language for DentiVerse. All UI components, screens, and marketing materials should follow these guidelines to ensure a consistent, professional, and trustworthy experience.

DentiVerse serves dental professionals — the UI must feel **clinical-grade** (trustworthy, precise) while remaining **modern and approachable** (not sterile or intimidating).

---

## Brand Personality

| Attribute | Description |
|-----------|-------------|
| **Trustworthy** | Dental professionals need to trust the platform with patient data and clinical-grade work |
| **Professional** | Clean, precise, no visual clutter — reflects the quality of the designs delivered |
| **Global** | Accessible to users worldwide, multi-language ready, culturally neutral |
| **Efficient** | Every screen should help users complete tasks faster, not slower |

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Blue** | `#2E5090` | Primary brand, headers, CTAs, links |
| **Deep Blue Light** | `#E8EFF8` | Backgrounds, hover states, cards |
| **Deep Blue Dark** | `#1A3260` | Active states, focus rings |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#2D7D46` | Approved, completed, positive actions |
| **Success Light** | `#E8F5E9` | Success backgrounds |
| **Warning** | `#E65100` | Urgency, pending actions, attention |
| **Warning Light** | `#FFF3E0` | Warning backgrounds |
| **Danger** | `#B71C1C` | Errors, disputes, destructive actions |
| **Danger Light** | `#FFEBEE` | Error backgrounds |
| **Info** | `#0277BD` | Tips, informational messages |
| **Info Light** | `#E1F5FE` | Info backgrounds |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Gray 900** | `#1A1A1A` | Primary text |
| **Gray 700** | `#4A4A4A` | Secondary text |
| **Gray 500** | `#8A8A8A` | Placeholder text, disabled |
| **Gray 300** | `#CCCCCC` | Borders, dividers |
| **Gray 100** | `#F5F5F5` | Page backgrounds |
| **White** | `#FFFFFF` | Card backgrounds, inputs |

### Role Colors (User badges & avatars)

| Role | Color | Hex |
|------|-------|-----|
| Dentist | Teal | `#0D9488` |
| Lab | Amber | `#D97706` |
| Designer | Purple | `#7C3AED` |
| Admin | Gray | `#6B7280` |

---

## Typography

**Font Family:** Inter (Google Fonts) — clean, modern, excellent readability at all sizes, wide language support.

**Fallback:** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 36px | 700 | 1.2 | Hero sections, landing page |
| **H1** | 30px | 700 | 1.3 | Page titles |
| **H2** | 24px | 600 | 1.3 | Section headers |
| **H3** | 20px | 600 | 1.4 | Card titles, subsections |
| **H4** | 16px | 600 | 1.4 | Labels, small headers |
| **Body** | 16px | 400 | 1.6 | Default body text |
| **Body Small** | 14px | 400 | 1.5 | Secondary info, table cells |
| **Caption** | 12px | 400 | 1.4 | Timestamps, metadata, hints |
| **Mono** | 14px | 400 | 1.5 | Code, IDs, file names |

**Mono font:** `"JetBrains Mono", "Fira Code", monospace`

---

## Spacing

Based on a 4px grid. Use Tailwind CSS utility classes.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `xs` | 4px | `p-1` | Inline padding, icon gaps |
| `sm` | 8px | `p-2` | Compact elements |
| `md` | 16px | `p-4` | Default padding |
| `lg` | 24px | `p-6` | Card padding, section gaps |
| `xl` | 32px | `p-8` | Page margins |
| `2xl` | 48px | `p-12` | Section spacing |
| `3xl` | 64px | `p-16` | Major section breaks |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small elements (badges, tags) |
| `md` | 8px | Buttons, inputs, small cards |
| `lg` | 12px | Cards, modals, dropdowns |
| `xl` | 16px | Large cards, dialogs |
| `full` | 9999px | Avatars, pills, toggles |

---

## Shadows

| Name | Value | Usage |
|------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift (buttons, badges) |
| `md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, popovers |
| `xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Hero cards, featured content |

---

## Component Library

**Base:** [shadcn/ui](https://ui.shadcn.com/) — built on Radix UI primitives + Tailwind CSS.

### Core Components Used

| Component | shadcn/ui | Customization |
|-----------|-----------|---------------|
| Button | `<Button>` | Primary (Deep Blue), Secondary (outline), Destructive (red), Ghost |
| Input | `<Input>` | 44px height, Gray 300 border, focus ring Deep Blue |
| Select | `<Select>` | For dropdowns (case type, software, etc.) |
| Card | `<Card>` | 12px radius, subtle shadow, white bg |
| Dialog/Modal | `<Dialog>` | Centered, backdrop blur |
| Sheet | `<Sheet>` | Side panels (case details, messages) |
| Table | `<Table>` | For case lists, payment history |
| Badge | `<Badge>` | Status badges with semantic colors |
| Avatar | `<Avatar>` | User photos with role-colored fallbacks |
| Tabs | `<Tabs>` | For dashboard views (active, completed, etc.) |
| Toast | `<Toast>` | Success/error notifications |
| Tooltip | `<Tooltip>` | Contextual help |
| Skeleton | `<Skeleton>` | Loading states |
| Command | `<Command>` | Search/filter palette |
| DropdownMenu | `<DropdownMenu>` | User menu, actions |

### Custom Components (to build)

| Component | Purpose |
|-----------|---------|
| `<CaseCard>` | Displays case summary with status badge, type, budget, deadline |
| `<DesignerCard>` | Designer profile card with rating, skills, availability |
| `<ProposalCard>` | Shows proposal details with accept/reject actions |
| `<STLViewer>` | 3D model viewer (Three.js / React Three Fiber) |
| `<FileUploader>` | Drag-and-drop with Uppy.js, progress bar, file type validation |
| `<StarRating>` | Interactive 5-star rating input |
| `<StatusTimeline>` | Visual case progress tracker (Draft → Open → ... → Completed) |
| `<ChatThread>` | Message thread UI with real-time updates |
| `<PriceTag>` | Currency-formatted price display |
| `<ToothChart>` | Interactive FDI tooth number selector |

---

## Status Badge Colors

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Draft | `#F5F5F5` | `#8A8A8A` | `#CCCCCC` |
| Open | `#E1F5FE` | `#0277BD` | `#0277BD` |
| Assigned | `#E8EFF8` | `#2E5090` | `#2E5090` |
| In Progress | `#FFF3E0` | `#E65100` | `#E65100` |
| Review | `#F3E5F5` | `#7C3AED` | `#7C3AED` |
| Revision | `#FFF3E0` | `#E65100` | `#E65100` |
| Approved | `#E8F5E9` | `#2D7D46` | `#2D7D46` |
| Completed | `#E8F5E9` | `#1B5E20` | `#1B5E20` |
| Cancelled | `#F5F5F5` | `#8A8A8A` | `#CCCCCC` |
| Disputed | `#FFEBEE` | `#B71C1C` | `#B71C1C` |

---

## Iconography

**Library:** [Lucide Icons](https://lucide.dev/) (open-source, consistent, tree-shakeable)

**Size:** 20px default, 16px in compact contexts, 24px for navigation

**Stroke width:** 1.5px (matches Lucide defaults)

### Key Icons

| Action | Icon | Context |
|--------|------|---------|
| Upload | `Upload` | File upload areas |
| Search | `Search` | Search bars |
| Filter | `SlidersHorizontal` | Filter controls |
| Case | `FileText` | Case listings |
| Crown | `Crown` | Case type indicator |
| Designer | `Palette` | Designer profiles |
| Message | `MessageSquare` | Chat/messaging |
| Payment | `CreditCard` | Payment sections |
| Star | `Star` | Ratings |
| Check | `CheckCircle` | Success, approved |
| Clock | `Clock` | Delivery time, deadlines |
| 3D | `Box` | 3D viewer |
| Settings | `Settings` | User settings |
| Notification | `Bell` | Notification center |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| `sm` | 640px | Mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

### Layout Rules

- **Mobile-first:** Design for `sm` first, then scale up
- **Sidebar:** Hidden on mobile, collapsible on tablet, visible on desktop
- **Dashboard grid:** 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
- **Cards:** Full width (mobile) → 2-up (tablet) → 3-up (desktop)
- **Max content width:** 1280px, centered

---

## Accessibility

- **Color contrast:** All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- **Focus indicators:** Visible focus ring (2px solid Deep Blue) on all interactive elements
- **Keyboard navigation:** Full keyboard support via Radix UI primitives
- **Screen reader:** Proper ARIA labels on all custom components
- **RTL support:** Layout must support right-to-left for Arabic users
- **Motion:** Respect `prefers-reduced-motion` — no essential info conveyed by animation alone

---

## Dark Mode

**Phase 1:** Light mode only (MVP)
**Phase 2:** Dark mode support via Tailwind `dark:` variants and CSS custom properties

---

## File Naming Conventions

```
components/
├── ui/                  # shadcn/ui base components
├── cases/
│   ├── case-card.tsx
│   ├── case-form.tsx
│   └── case-status-badge.tsx
├── designers/
│   ├── designer-card.tsx
│   └── designer-search.tsx
├── viewer/
│   └── stl-viewer.tsx
├── shared/
│   ├── file-uploader.tsx
│   ├── star-rating.tsx
│   └── tooth-chart.tsx
└── layout/
    ├── sidebar.tsx
    ├── header.tsx
    └── footer.tsx
```

---

*This design system is a living document. Update as components are built and patterns emerge.*
