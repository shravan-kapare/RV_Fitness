# RV FITNESS — Visual Design System & Motion Specification

**Facility:** RV Fitness, Narsobawadi, Maharashtra, India  
**Brand Archetype:** High-performance dark-luxury commercial gym  
**Visual Style:** Editorial, restrained, high-contrast, art-directed  

---

## 1. Brand Tokens & Color Palette

The RV Fitness color system establishes a focused, masculine, and authoritative gym atmosphere. It deliberately avoids generic SaaS blues, neon glows, or oversaturated borders.

```
+-----------------------------------------------------------------------+
|  CANVAS / BACKGROUNDS                                                |
|  Near-Black:      #080808 (Deep application background)              |
|  Deep Black:      #000000 (Pure contrast canvas & image backdrops)   |
|  Secondary:       #111111 (Primary card containers, table headers)   |
|  Elevated:        #171717 (Inputs, modals, floating panels)          |
|  Surface Hover:   #1E1E1E (Row hover, dropdown item highlight)       |
+-----------------------------------------------------------------------+
|  DIVIDERS & BORDERS                                                   |
|  Subtle Border:   #292929 (1px dividing lines, card outlines)        |
|  Divider:         #1F1F1F (Internal row dividers)                    |
+-----------------------------------------------------------------------+
|  TYPOGRAPHY                                                           |
|  Primary Text:    #F5F5F5 (Warm white for headlines, prices, titles) |
|  Muted Text:      #A5A5A5 (Neutral secondary descriptions, labels)   |
|  Subtle Text:     #737373 (Eyebrow text, line numbers, table footers)|
+-----------------------------------------------------------------------+
|  BRAND ACCENT (RESTRAINED GOLD / YELLOW)                              |
|  Brand Gold:      #FFC21A (Primary CTAs, active nav, plan prices)    |
|  Gold Hover:      #E6AC12 (Deeper gold for hovered active buttons)   |
|  Gold Dark:       #D49D0E (Active pressed state)                     |
|  Gold Light:      #FFD45E (Subtle badge accents, highlights)         |
+-----------------------------------------------------------------------+
|  SEMANTIC STATUS COLORS                                               |
|  Success / Paid:  Emerald #34D399 (Paid dues, matched records)       |
|  Warning / Due:   Amber #FBBF24 (Pending reviews, 1-30d aging)       |
|  Critical / Error:Rose #F87171 (Overdue invoices, rejected refunds)  |
+-----------------------------------------------------------------------+
```

### The Restrained Yellow Rule
Yellow (`#FFC21A`) is the high-energy RV Fitness brand accent. **It must never be used indiscriminately.**
- **DO use `#FFC21A` for:** Primary "Join Now" and "Record Payment" action buttons, active navigation indicator pills, membership package pricing figures, and small branded details (e.g. the RV monogram).
- **DO NOT use `#FFC21A` for:** Every icon, full card backgrounds, all borders, standard table headers, or normal text paragraphs. All standard containers must remain dark charcoal (`#111111` / `#171717`) with warm white text (`#F5F5F5`).

---

## 2. Typography & Numerical Alignment

### Hierarchy
- **Editorial Hero Headlines:** `text-4xl sm:text-6xl font-black uppercase tracking-tight` (e.g. *"BUILD YOUR STRENGTH. DEFINE YOURSELF."*)
- **Page Titles:** `text-xl sm:text-2xl font-black tracking-tight uppercase text-[#F5F5F5]`
- **Section Headers:** `text-sm sm:text-base font-bold uppercase tracking-wider text-[#F5F5F5]`
- **Eyebrow Tags:** `text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FFC21A]`
- **Body Text:** `text-sm text-[#A5A5A5] leading-relaxed`

### Tabular Numerals for Financial Data
All monetary values, day counts, invoice numbers, and percentages **must** include the CSS class `tabular-nums font-mono`. This ensures that digits occupy identical horizontal widths, preventing jagged alignment across ledger columns.

---

## 3. UI Component Specifications

### 3.1 Buttons
- **Primary:** `bg-[#FFC21A] hover:bg-[#E6AC12] text-[#080808] font-bold rounded-lg px-4 py-2.5 transition-all shadow-md`
- **Secondary:** `bg-[#171717] hover:bg-[#1E1E1E] text-[#F5F5F5] border border-[#292929] rounded-lg px-4 py-2.5`
- **Ghost:** `bg-transparent hover:bg-[#171717] text-[#A5A5A5] hover:text-[#F5F5F5] rounded-lg px-3 py-1.5`
- **Danger:** `bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg`

### 3.2 Cards & Elevated Surfaces
- Default card background: `#111111` with a clean 1px border `#292929` and `rounded-xl`.
- Subtle hover state: border shifts from `#292929` to `#3B3B3B` with `transform: translateY(-2px)`.
- No loud drop shadows or glowing borders; elevation is achieved strictly through surface shade progression (`#080808` canvas $\rightarrow$ `#111111` card $\rightarrow$ `#171717` internal control).

### 3.3 Tables
- Table header row: `#141414` background with `#A5A5A5` text, uppercase, `text-[11px] font-semibold`.
- Table body rows: divided by `#1F1F1F`. Row hover: `#171717` with smooth 150ms transition.
- Numerical columns (amounts, dates, items) are right-aligned with `tabular-nums font-mono`.

---

## 4. Gym-Focused Motion & Animation Specification

### 4.1 Public Website Animation Principles
1. **Cinematic Hero Reveal:**
   - Background gym photography smoothly fades in (`opacity: 0` $\rightarrow$ `1` over 800ms).
   - The headline *"BUILD YOUR STRENGTH. DEFINE YOURSELF."* reveals with a staggered upward slide (`translateY(20px)` $\rightarrow$ `translateY(0)` with spring damping).
2. **Subtle Light Sweep on Brand Mark:**
   - A soft, linear metallic sheen sweeps across the RV Fitness gold mark on hover.
3. **Scroll-Triggered Section Entrances:**
   - As the user scrolls into view, components reveal sequentially with a 60ms stagger.
4. **The Four Forces of Progress (Interactive Motion):**
   - 4 pillars: *Discipline, Power, Recovery, Mindset*.
   - Hovering each force illuminates its subtle gold accent line and displays an animated SVG glyph (barbell, pulse, shield, flame).
5. **Membership Card Reveal:**
   - Cards scale slightly ($1.00 \rightarrow 1.02$) on hover, highlighting the "Best Value" gold badge.

### 4.2 Portal & Financial Workspace Motion
- Fast, utilitarian, non-distracting.
- Page transition: instant 150ms `fadeIn` (`opacity: 0; transform: translateY(4px)` $\rightarrow$ `opacity: 1; transform: translateY(0)`).
- Modal backdrops: smooth `rgba(0,0,0,0.75)` fade-in.
- Financial tables and payment inputs **must remain stable** and never bounce or slide during data entry.
- **Accessibility:** Full `@media (prefers-reduced-motion: reduce)` compliance, suppressing animations for users who prefer reduced motion.
