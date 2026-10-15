# RV FITNESS — Unified Visual Design System & UI Specification

**Facility:** RV Fitness, Narsobawadi, Maharashtra, India  
**Brand Archetype:** High-performance, authentic strength-training sanctuary  
**Visual Style:** Editorial, cinematic, image-led, restrained luxury, high-contrast  

---

## 1. Brand Tokens & Color Palette

The RV Fitness color system establishes a focused, disciplined, and authentic gym environment. It deliberately avoids generic SaaS blues, excessive neon glows, and oversaturated borders.

```
+---------------------------------------------------------------------------------+
|  CANVAS / BACKGROUNDS                                                           |
|  Obsidian Canvas:  #080808 (Deep primary application background)                |
|  Surface Base:     #0D0D10 / #111114 (Secondary background, dark section flow)  |
|  Card / Container: #141418 (Cards, tables, modal bodies, dropdowns)             |
|  Elevated Surface: #1A1A20 (Inputs, interactive hover rows, floating badges)    |
|  Warm Light Canvas:#F5F4F0 / #FAF9F5 (Public editorial alternating light sections|
+---------------------------------------------------------------------------------+
|  DIVIDERS & BORDERS                                                             |
|  Dark Border:      #222226 / rgba(255, 255, 255, 0.08)                          |
|  Light Border:     #E5E4E0 / #E0DED9 (For warm light public sections)           |
+---------------------------------------------------------------------------------+
|  TYPOGRAPHY                                                                     |
|  Dark Surface Text:#FFFFFF / #F5F5F5 (Headings, metric values, titles)          |
|  Dark Muted Text:  #9CA3AF / #A5A5A5 (Secondary descriptions, field labels)     |
|  Light Surface Text:#171717 (Headings, titles in warm-light sections)           |
|  Light Muted Text: #525252 / #666666 (Body copy in warm-light sections)         |
+---------------------------------------------------------------------------------+
|  BRAND ACCENT (RESTRAINED GOLD / AMBER)                                         |
|  Brand Yellow:     #FFC21A (Primary CTAs, active nav items, key figures)        |
|  Yellow Hover:     #E5AD16 (Hover state for primary buttons)                    |
|  Yellow Glow:      rgba(255, 194, 26, 0.15) (Subtle button shadow)              |
|  Amber Warm Accent:#B45309 (Pillars & eyebrow labels on warm-light sections)    |
+---------------------------------------------------------------------------------+
|  SEMANTIC STATUS COLORS                                                         |
|  Success / Active: #10B981 (Emerald: Paid dues, active membership, pass granted)|
|  Warning / Due:    #F59E0B (Amber: Pending reviews, due invoices, expiring pass)|
|  Danger / Overdue: #EF4444 (Rose/Red: Overdue accounts, rejected, error)       |
|  Info / Token:     #3B82F6 (Blue: Information banners, audit logs)              |
+---------------------------------------------------------------------------------+
```

### The Restrained Yellow Rule
Yellow (`#FFC21A`) is the high-energy RV Fitness brand accent.
- **DO use `#FFC21A` for:** Primary "Explore Memberships", "Record Payment", and "Save" action buttons, active navigation indicator icons, pricing figures, and discrete verification badges.
- **DO NOT use `#FFC21A` for:** Every icon, entire card backgrounds, excessive borders, standard table headers, or full paragraphs. Administrative and member interfaces maintain a clean dark charcoal base so information is readable without visual fatigue.

---

## 2. Typography & Numerical Alignment

### Hierarchy
- **Hero Display:** `text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.02]`
- **Section Headlines:** `text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F5]`
- **Administrative Page Titles:** `text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]` (avoid oversized decorative text on administrative workbenches)
- **Card & Modal Titles:** `text-base sm:text-lg font-bold text-[#F5F5F5]`
- **Eyebrow Tags:** `text-xs font-mono font-bold uppercase tracking-wider text-[#FFC21A]` (or `#B45309` on light surfaces)
- **Body Text:** `text-sm text-[#A5A5A5] leading-relaxed font-normal`
- **Data Labels:** `text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]`

### Tabular Numerals for Financial & Biometric Data
All numbers, rupee currency strings (`formatCurrency`), member codes (`RV-2026-XXXX`), dates, and workout sets/reps MUST utilize tabular figures:
```css
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

---

## 3. Shared Component Specifications

### Buttons (`Button.tsx`)
- **Primary:** `bg-[#FFC21A] text-black font-extrabold hover:bg-[#e5ad16] shadow-md shadow-[#FFC21A]/10 active:scale-[0.98] rounded-xl`
- **Secondary:** `bg-[#141418] text-[#F5F5F5] border border-white/10 hover:bg-[#1E1E24] hover:border-white/20 active:scale-[0.98] rounded-xl`
- **Danger:** `bg-rose-600/90 text-white font-semibold hover:bg-rose-500 rounded-xl`
- **Ghost:** `text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/5 rounded-xl`
- **Sizes:** `sm: text-xs px-3 py-1.5`, `md: text-sm px-4 py-2`, `lg: text-base px-6 py-3`

### Cards & Surfaces (`Card.tsx`)
- `bg-[#141418] border border-white/10 rounded-2xl overflow-hidden shadow-lg`
- Header: `px-6 py-4 border-b border-white/10 flex items-center justify-between`
- Body: `p-6`
- Footer: `px-6 py-4 border-t border-white/10 bg-[#111114]/50`

### Inputs & Form Fields (`Input.tsx`, `Select.tsx`)
- `bg-[#16161A] border border-white/10 rounded-xl text-[#F5F5F5] text-sm px-3.5 py-2.5 focus:border-[#FFC21A] focus:ring-1 focus:ring-[#FFC21A]/20 transition-colors`
- Labels: `block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5`

### Tables (`Table.tsx`)
- Header: `bg-[#191920] border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]`
- Rows: `divide-y divide-white/5 text-xs text-[#E5E5E5]`
- Interactive hover: `hover:bg-[#1E1E26] transition-colors`
- Numbers & dates right-aligned with `tabular-nums font-mono`

### Status Badges (`Badge.tsx`, `StatusBadge.tsx`)
- Pill geometry: `px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider border`
- Success: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- Warning: `bg-amber-500/10 text-amber-400 border-amber-500/20`
- Danger: `bg-rose-500/10 text-rose-400 border-rose-500/20`
- Neutral: `bg-white/5 text-[#A5A5A5] border-white/10`

---

## 4. Portal-Specific Layout Directives

1. **Public Website:**
   - Cinematic image-led hero sections with subtle parallax.
   - Alternating dark (`#080808` / `#0D0D10`) and warm light (`#F5F4F0` / `#FAF9F5`) sections.
   - Genuine gym photography representing real equipment and training areas.
   - 100% database-driven pricing, trainers, events, and gallery items.

2. **Admin Operations & Billing:**
   - Compact `h-16` header with breadcrumbs and facility context.
   - Dense, readable data tables with pagination and search debounce.
   - Fast turnstile desk with large status notifications.
   - Traceable PDF receipt downloads and financial adjustments.

3. **Trainer Workspace:**
   - Prominent athlete roster with direct links to workouts and diet builders.
   - Modal-driven quick assessment loggers for biometrics (weight, BMI, body fat).
   - Clear day-by-day split schedules.

4. **Member Self-Service:**
   - Immediate visibility into today's assigned workout or rest day.
   - Membership expiry countdown badge.
   - High-contrast digital turnstile QR pass for desk entry.
   - Zero access to billing management of other members.
