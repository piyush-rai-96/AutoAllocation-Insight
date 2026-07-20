# AutoAllocation Insights Agent

A visual **diagnostic & triage console** for retail auto-allocation cycles. It reviews how a cycle's inventory was allocated across stores, surfaces where demand won't be met and *why*, and recommends the actions that recover the most sales — as a ranked, drill-downable, exportable workspace.

> **Status:** Baseline cycle snapshot · read-only diagnostics · single-cycle demo dataset.

> **📚 Documentation map** — start here based on who you are:
> - **`AGENT.md`** *(this file)* — full system & technical overview. Start here for the big picture.
> - **`BUSINESS_GUIDE.md`** — business & implementation view: what each section does, all KPIs, data inputs, rollout.
> - **`INSIGHTS.md`** — technical field-level mapping: insight ↔ playbook ↔ KPI, data sources, "add a bucket" guide.
> - **`OVERVIEW.md`** — one-page plain-language business summary.

---

## 1. What the agent does

Given the output of an auto-allocation run (plans → style-colors → stores → sizes), the agent:

1. **Scores the cycle** — how many plans are safe, constrained, urgent.
2. **Diagnoses root causes** — runs 6 diagnostic checks and groups affected plans into *insight buckets* (Min Constraints, Max Capping, Pack Config, DC Inventory & Multi-DC Sourcing, Size Curve, Store Capacity).
3. **Quantifies impact** — 5 headline KPIs (units, DC consumption/sourcing, unmet rate, revenue at risk, stores near capacity) plus FWOS (forward-weeks-of-supply) urgency flags.
4. **Recommends fixes** — a prioritized playbook written as *What's happening → Why it matters → What to do next*.
5. **Lets the operator act** — drill from plan to the exact store/size, copy IDs/POs, and export any bucket as CSV.

It is intentionally **read-only**: it explains and recommends; it does not mutate the allocation.

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **React 18** (functional components + hooks) |
| Build/dev | **Vite 5** (`npm run dev` / `build` / `preview`) |
| Styling | **Tailwind CSS 3** (custom keyframes/shadows in `tailwind.config.js`) |
| Icons | **lucide-react** |
| State | Local React state (no external store); mock data module |

No backend — all data is a static module (`src/data/mockData.js`) that mirrors a real cycle's shape, so the UI is fully deterministic and demo-ready.

---

## 3. Project structure

```
AutoAllocation Insights/
├── AGENT.md            ← this file (full agent overview)
├── INSIGHTS.md         ← technical field-level mapping + "how to add a bucket"
├── OVERVIEW.md         ← plain-language business overview
├── package.json
├── tailwind.config.js  ← custom keyframes/animations + shadows
└── src/
    ├── App.jsx         ← app bar + section layout (Triage → KPIs → Playbook → Handbook)
    ├── data/
    │   └── mockData.js ← single source of truth for all sections
    └── components/
        ├── TriageRibbon.jsx    ← cycle scorecard + diagnostic checks + filters
        ├── KpiStrip.jsx        ← 5 headline KPI cards
        ├── Playbook.jsx        ← ranked What→Why→Next action cards
        ├── InsightsStudio.jsx  ← the Insight Handbook (drawers, trees, tables)
        ├── SectionHeader.jsx   ← shared section title
        ├── Sparkline.jsx       ← inline KPI trend line
        ├── Tooltip.jsx         ← hover tooltip
        ├── Toast.jsx           ← toast provider + useToast hook
        ├── Worklist.jsx        ← (auxiliary) plan worklist view
        └── ValidationChecks.jsx← (auxiliary) checks view
```

`App.jsx` renders four sections in order: **Triage Ribbon → Overview (KPIs) → Smart Actions Playbook → Insight Handbook**, wrapped in a `ToastProvider`.

---

## 4. The four console sections

### 4.1 Triage Ribbon (`TriageRibbon.jsx`)
The cycle scorecard. Three clickable cards — **Total Plans (10)**, **No Issues / Safe (2)**, **Plans with Issues (8)** — act as filters that scroll to and scope the Handbook. Also lists the **6 diagnostic checks** run against every plan:

1. Min Constraints Influencing Allocation
2. Max Capping Allocation
3. Pack Config → Under / Over Allocation
4. DC Inventory & Multi-DC Sourcing
5. Store Capacity Soft Constraint
6. Size Curve Deviation

Data: `triage` + `worklist` in `mockData.js`.

### 4.2 Overview — KPIs (`KpiStrip.jsx`)
5 headline cards (3-column grid), each with a value, supporting lines, a sparkline trend, a delta, and hover overlays/warnings.

| KPI | Value | Accent | Signal |
|-----|-------|--------|--------|
| Units Allocated | 5,894 | slate | 53.8% of 10,957 demand pool |
| DC Consumption & Sourcing | 9.3% ⚠ | amber | DC ATA used + **primary DC over-bound 112%**, 1,240u (21%) fallback from DC-02 |
| Demand Unmet Rate | 47.6% ⚠ | rose | 52.4% met · **FWOS < 1** at 23/141 stores · 3-run rise |
| Revenue at Risk | $221.00 | violet | 4 high-exposure stores |
| Stores Near Capacity | 9 | indigo | 2 project over 100% fill |

Data: `kpis[]`. Icons resolved via a string `iconMap`; colors via an `accentMap`.

### 4.3 Smart Actions Playbook (`Playbook.jsx`)
Ranked, collapsible action cards — one per insight bucket — each structured as **What → Why → Next step**, with a lost-sales estimate and a **trigger** that exports the matching bucket. Cards pair to Handbook buckets via a shared `exportBucketId`.

Data: `playbook[]`.

### 4.4 Insight Handbook (`InsightsStudio.jsx`)
The detail view — expandable diagnostic **drawers**, one per bucket. Each drawer shows a macro-impact line, a directory title/hint, an **Export** button, and one of three body renderers based on `type`:

- **`tree`** — Plan → Style-Color → Store hierarchy (Min Constraints, Max Capping, Pack Config, Size Curve).
- **`poTable`** — DC-constrained components with a **Multi-DC sourcing flow** strip (DC Inventory).
- **`capacityTable`** — per-store capacity utilization bars (Store Capacity).

Data: `insights[]`.

---

## 5. The six insight buckets

| Bucket (`id`) | Type | Tone | Severity | Core signal |
|---------------|------|------|----------|-------------|
| Min Constraints (`minConstraints`) | tree | sky | Critical | Minimum floors force +1,606 units into slow stores |
| Max Capping (`maxCapping`) | tree | slate | Warning | Store ceilings throttle 190 sellable units |
| Pack Config (`packConfig`) | tree | indigo | Warning | Case-pack rounding blocks 6,977 units (main OOS driver) |
| DC Inventory & Multi-DC Sourcing (`dcInventory`) | poTable | rose | Critical | Primary DC over-bound 112% → 1,240u fallback from secondary DC |
| Size Curve (`sizeCurve`) | tree | amber | Warning | Over-shipped XL / under-shipped Small |
| Store Capacity (`storeCapacity`) | capacityTable | teal | Warning | Projected fill nearing/over store capacity (9/141 stores) |

---

## 6. Signature visualizations

### Multi-DC Sourcing Flow (`DcSourcingFlow`)
Inside the DC Inventory drawer: a **primary DC depletion gauge** (pulsing red when over-bound) → animated fallback arrow → **secondary DC draw gauge**. Each PO row also carries a rose *primary-DC status* chip and a violet *"Sourced from … · +units"* fallback chip.

### Store Capacity utilization (`CapacityTable` / `CapacityRow`)
Per-store card with:
- A **radial utilization gauge** (`CapacityGauge`) — SVG ring, color-banded (rose/amber/emerald), red glow when over-capacity.
- A **stacked, gradient bar** (On Hand / On Order / In Transit / New Allocation) that animates in (`barFill`), against a **dashed 100% ceiling** marker.
- An **overflow spill zone** (red diagonal hatch past the ceiling) and a pulsing **Over Capacity** chip (`overflowPulse`).
- A **headroom / +over** readout and a table-level **summary strip** (Over / Near / Within counts).

### FWOS < 1 urgency
Stores with less than one forward week of supply are the leading edge of unmet demand. Surfaced on the *Demand Unmet Rate* KPI and as per-plan glowing flag chips (`fwos` / `fwosStores` on `worklist[]`).

---

## 7. Data model (`src/data/mockData.js`)

Single source of truth. Key exports:

| Export | Feeds | Shape |
|--------|-------|-------|
| `triage` | Triage Ribbon | cycle counts (all / safe / issues / urgent) |
| `worklist[]` | Triage filters, plan meta, FWOS | per-plan rate, unmet, revenue, status, `fwos`, `fwosStores` |
| `kpis[]` | KPI strip | value, `accent`, `icon`, `lines`, `spark`, `delta`, `overlay`, `warning`, `tooltip` |
| `playbook[]` | Playbook | severity, what/why/next, `lostSalesValue`, `exportBucketId` |
| `insights[]` | Handbook | `id`, `tone`, `iconName`, `title`, `type`, `macro`, plus `plans`/`rows`/`dcFlow` |
| `getPlanMeta(id)` | Handbook, ranking | plan metrics lookup from `worklist` |
| `buildInsightExport(bucketId)` | Export buttons | CSV rows for `tree` / `poTable` / `capacityTable` |
| `getWorklistSummary(excludeIds)` | summaries | risked vs safe rollups |

---

## 8. Interaction & UX behaviors

- **Filtering** — Triage cards filter the Handbook and smooth-scroll to it.
- **Drill-down** — plan → style-color → store, each level expandable.
- **Top-N + export** — Handbook trees show **top 10 plans** (ranked by revenue at risk), **top 5 style-colors** per plan, **top 5 stores** per style. A *"Showing top N of M — Export full list"* footer appears **only when truncated** and copies the full bucket CSV. Constants: `MAX_PLANS` / `MAX_STYLES` / `MAX_STORES`.
- **Copy affordances** — copy plan IDs, PO numbers, and full plan/style/store combinations to clipboard (toast confirmation).
- **Export** — every bucket exports a CSV to the clipboard via `buildInsightExport()`.
- **Motion** — custom keyframes (`nodeIn`, `growLine`, `barFill`, `overflowPulse`, `pulseRail`, `floatUp`, `sheen`, `drawerIn`) give premium, purposeful animation.

---

## 9. Extensibility — adding a new insight bucket

The Handbook is **data-driven**; a new dimension needs no per-id UI wiring. Central registries in `InsightsStudio.jsx`:

- **`ACCENT_DOT`** — tone token → accent dot color (12 colors pre-registered: sky, slate, rose, amber, teal, indigo, violet, emerald, cyan, fuchsia, orange, blue).
- **`ICONS`** — `iconName` string → lucide component (13 pre-registered).
- **`DRAWER_STYLE`** — shared neutral drawer chrome.

**To add a bucket:**
1. Append to `insights[]` with `id`, `title`, `macro`, `directoryTitle`/`directoryHint`, a `tone`, an `iconName`, and a `type` (`tree` / `poTable` / `capacityTable`).
2. *(Optional)* add a `playbook[]` card sharing an `exportBucketId`, and a Triage check label.
3. Only if you need a **new** color/icon, register it once in `ACCENT_DOT` / `ICONS`.

A brand-new `type` also needs a renderer + a `buildInsightExport()` branch. The pre-registered colors/icons already cover **5+ more buckets** with zero new registration. Full walkthrough in `INSIGHTS.md`.

---

## 10. Running it

```bash
npm install
npm run dev      # Vite dev server (HMR)
npm run build    # production build
npm run preview  # preview the build
```

---

## 11. Companion docs

- **`INSIGHTS.md`** — technical field-level mapping: sections, KPIs, triage checks, the insight ↔ playbook ↔ KPI master map, FWOS flags, and the "add a bucket" guide.
- **`OVERVIEW.md`** — plain-language business overview of the KPIs, issues, and where the money is.

*Baseline cycle snapshot · read-only diagnostics.*
