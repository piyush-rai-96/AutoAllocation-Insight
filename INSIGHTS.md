# AutoAllocation Insights — Insight Specification

A reference map of every diagnostic Insight in the console: which **UI section** surfaces it, which **KPI** it drives, its paired **action narrative**, the **data source**, **severity**, and **FWOS** (Forward Weeks of Supply) impact.

> Source of truth: `src/data/mockData.js`. UI: `src/components/*`. This doc mirrors the mock dataset for the baseline cycle snapshot.

> **📚 Documentation map** — start here based on who you are:
> - **`AGENT.md`** — full system & technical overview. Start here for the big picture.
> - **`BUSINESS_GUIDE.md`** — business & implementation view: what each section does, all KPIs, data inputs, rollout.
> - **`INSIGHTS.md`** *(this file)* — technical field-level mapping: insight ↔ action ↔ KPI, data sources, "add a bucket" guide.
> - **`OVERVIEW.md`** — one-page plain-language business summary.

---

## 1. Console Sections (top → bottom, 3 sections)

Rendered by `src/App.jsx` inside `<main>`:

| Order | Section | Component | Purpose |
|------|---------|-----------|---------|
| 1 | **Triage Ribbon** | `TriageRibbon.jsx` | Cycle-level counts + validation checks; filters into the Insights section |
| 2 | **Overview (KPIs)** | `KpiStrip.jsx` | 5 core health metrics at a glance |
| 3 | **Insights & Smart Actions** | `InsightsStudio.jsx` | One card per bucket: collapsed summary → **Action** (What → Why → Next-Step + export) → nested **Evidence** drill-down (Plan → Style-Color → Store) |

The merged section reads `insightCards[]` — a selector in `mockData.js` that joins each `insights[]` bucket (evidence) with its `playbook[]` card (action narrative) on `exportBucketId`. A dark header banner shows total/critical/warning counts + **Expand/Collapse all**.

**Evidence display caps (top-N + export):** plan-tree drawers show the **top 10 plans** (ranked by revenue at risk), each plan the **top 5 style-colors**, each style-color the **top 5 stores**. When a list exceeds its cap, a *"Showing top N of M — Export full list"* footer appears (only when truncated) that copies the complete bucket CSV via `buildInsightExport()`. Constants: `MAX_PLANS` / `MAX_STYLES` / `MAX_STORES` in `InsightsStudio.jsx`. The DC PO table and Store Capacity table are left uncapped (already short, high-signal rows).

---

## 2. Overview KPIs

Data: `kpis[]` in `mockData.js`. Rendered as cards in `KpiStrip.jsx`.

| KPI (id) | Value | Accent | Supporting lines | Drives / relates to |
|----------|-------|--------|------------------|---------------------|
| Units Allocated (`units`) | 5,894 | slate | Rate 53.8%, Demand Pool 10,957 | Overall throughput |
| DC Consumption & Sourcing (`ata`) | 9.3% | amber | 5,894 / 63,108 drawn · 57,214 left; ⚠ **Primary DC-01 over-bound 112%**; Fallback 1,240u (21%) from DC-02 | **DC Inventory & Multi-DC Sourcing** insight |
| Demand Unmet Rate (`oos`) | 47.6% | rose | Demand Met 52.4%; ⚠ **FWOS < 1**: 23 of 141 stores under 1-wk cover; ⚠ 3-run increase | **Pack Config**, all under-allocation insights |
| Revenue at Risk (`revenue`) | $221.00 | violet | 2.00 est. lost units; 4 high-exposure stores | **Pack Config**, **DC Inventory** |
| Stores Near Capacity (`storesNearCapacity`) | 9 | indigo | Of 141 stores; ⚠ 2 project over 100% fill | **Store Capacity & Total Store Velocity** insight |

> The DC consumption and secondary-DC sourcing signals are merged into a single **DC Consumption & Sourcing** KPI so the whole warehouse story reads from one tile.

**FWOS anchor:** the *Demand Unmet Rate* KPI is the leading home for the FWOS < 1 signal — stores with less than one forward week of supply are the leading edge of unmet demand.

---

## 3. Triage Ribbon — Validation Checks

Data: `triage` + `validationChecks[]` in `mockData.js`.

**Cycle counts:** 10 Active Plans (20 products / 141 stores) · 2 Safe (simulated) · 8 Issues · 4 Urgent.

| Check | Status | Severity | Count | Note |
|-------|--------|----------|-------|------|
| DC ATA Over-Drain | FLAGGED | CRITICAL | 4 | 100% of safety buffer breached |
| Priority Inversion | FLAGGED | MEDIUM | 2 | 6 plans ran out of priority sequence |
| Single Store Concentration | FLAGGED | MEDIUM | 2 | 1 plan concentrated >75% into one outlet |
| Store Capacity & Velocity Breach | FLAGGED | CRITICAL | 12 | 5 over physical capacity; 4 bloated (>20 WOS); 3 breach both physical + velocity |
| Size Curve Deviation | CLEAR | NONE | 0 | Distributions match baseline |

**Diagnostic checks tooltip (Triage "Plans with Issues"):** 6 checks — Min Constraints, Max Capping, Pack Config, DC Inventory & Multi-DC Sourcing, Store Capacity & Total Store Velocity, Size Curve Deviation.

---

## 4. Insight ↔ Action ↔ KPI Master Map

Each insight bucket (`insights[]`) pairs with an action narrative (`playbook[]`) via a shared `exportBucketId`; `insightCards[]` merges them into one card. Both export the same CSV rows through `buildInsightExport()`. (Field labeled *Action* below is the `playbook[]` entry id.)

### A. Min Constraints Influencing Allocation
- **Insight id:** `minConstraints` · **Action:** `cardMinConstraints`
- **Severity:** Critical · **Tone:** sky · **Type:** tree
- **Scope:** 3 plans · 1,194 SKU-Store-Size combos · 1,606 excess units over-allocated
- **Related KPI:** Units Allocated (over-allocation), Demand Unmet Rate (starved flagship stores)
- **What:** Binding minimum floors force allocation above true localized demand.
- **Why:** Slow channels trap stock, risking markdowns while high-velocity stores starve.
- **Next step:** Relax/waive floors where min > 1 but trailing sales < 1 unit/week.
- **Lost sales:** ~$1,606 markdown exposure
- **Plans:** PLN-118 (+980u), PLN-124 (+626u)

### B. Max Capping Allocation
- **Insight id:** `maxCapping` · **Action:** `cardMaxCapping`
- **Severity:** Warning · **Tone:** slate · **Type:** tree
- **Scope:** 2 plans · 312 combos at ceiling · 190 units throttled
- **Related KPI:** DC ATA Consumed (parked stock), Demand Unmet Rate
- **What:** Store-level ceilings throttled 312 combos, holding 190 units.
- **Why:** Max-cap guardrails stopped allocation short of localized demand.
- **Next step:** Raise/waive ceilings where DC availability + demand support more.
- **Lost sales:** ~$190 deferred demand
- **Plans:** PLN-101 (-190u)

### C. Pack Config → Under / Over Allocation
- **Insight id:** `packConfig` · **Action:** `cardPackConfig`
- **Severity:** Warning · **Tone:** amber · **Type:** tree
- **Scope:** 7 plans · 1,271 combos · 6,977 units off pack multiple
- **Related KPI:** **Demand Unmet Rate (47.6%)**, Revenue at Risk ($221)
- **What:** Pack-size rounding blocks 6,977 units across 7 runs.
- **Why:** Rounding between case-pack multiples creates an artificial 47.6% OOS rate.
- **Next step (soft):** *Review* pack-rounding config — consider "Hard Floor" → "Round to Nearest Pack" if policy allows.
- **Lost sales:** ~$221.00 revenue at risk
- **Plans:** PLN-092 (-4,156u), PLN-104 (-450u)

### D. DC Inventory & Multi-DC Sourcing
- **Insight id:** `dcInventory` · **Action:** `cardDcInventory`
- **Severity:** Critical · **Tone:** rose · **Type:** poTable · **Badge:** HIGH SEVERITY ANOMALY
- **Scope:** 4 plans · 16 product-store combos; primary DC over-bound/exhausted → secondary-DC fallback
- **Related KPI:** **DC Consumption & Sourcing (9.3%, ⚠ primary over-bound + 1,240u fallback)**, Revenue at Risk
- **What:** Primary DC (DC-01 · North) over-bound at 112% / exhausted on core styles; allocation falls back to a secondary DC (DC-02 · Central) — 1,240 units (21% of draw) sourced cross-DC.
- **Why:** When the primary DC drains below buffer or past its safe bound, the runner reaches into a secondary DC to keep plans moving — masking the shortfall and adding cross-DC lead time/handling cost.
- **Next step:** Review each cross-DC fallback (can the secondary spare the draw?); trace exhausted components to pending POs (ETA); hold/reprioritize plans on the over-bound primary DC.
- **Lost sales:** ~$221.00 revenue at risk (POs ETA Jul 28 – Aug 02); 1,240 units carry cross-DC lead time
- **Multi-DC UI:** `DcSourcingFlow` strip (primary depletion gauge → animated arrow → secondary draw gauge) + per-row **Primary DC status** chip (rose) and **"Sourced from … · +units"** fallback chip (violet).
- **Rows:** KS1002733 001 (Exhausted, DC-01 → DC-02 +820 → PO-2026-X992), KS1002698 420 (Over-Bound, DC-01 → DC-02 +420 → PO-2026-X411)

### E. Size Curve Deviation
- **Insight id:** `sizeCurve` · **Action:** `cardSizeCurve`
- **Severity:** Warning · **Tone:** amber · **Type:** tree
- **Scope:** 1 plan · shipped profile deviates from baseline
- **Related KPI:** Revenue at Risk (sell-through erosion)
- **What:** Over-allocated XL / under-allocated Small at the affected store.
- **Why:** Oversupplied sizes get marked down; undersupplied sizes stock out.
- **Next step:** Check existing store inventory for a **store-to-store (S2S) transfer** to cover Small — or review binding constraints to confirm the skew is fixable at source.
- **Lost sales:** Sell-through risk
- **Plans:** PLN-108

### F. Store Capacity & Total Store Velocity
- **Insight id:** `storeCapacity` · **Action:** `cardStoreCapacity`
- **Severity:** Critical (WARNING baseline; CRITICAL when a store breaches BOTH physical capacity ≥ 100% and an extreme WOS bound) · **Tone:** teal · **Type:** capacityTable · **Badge:** MACRO STORE HEALTH
- **Scope:** Macro store health — 12 stores flagged · 5 over physical capacity · 4 bloated (>20 WOS) · 1,842 total overflow units
- **Related KPI:** **Stores Near Capacity (9)**
- **Financial exposure:** Fill / Handling Risk + ~$530K Capital Lockup (backroom overflow risk combined with capital tied up in slow-turning stores).
- **What:** Stores where projected allocations breach physical backroom capacity (On Hand + On Order + In Transit + New Allocation) and/or aggregate cover across all auto-replenished SKUs falls outside the healthy store-velocity band (Store WOS > 20 or < 2).
- **Why:** Physical overfill strands stock in backrooms off the sales floor; store-wide WOS bloat ties up working capital and slows total store inventory turns — macro problems item-by-item tweaks cannot solve.
- **Next step:** Apply macro store-level fixes before dispatch — trim/stagger new allocations, place a temporary store-wide auto-replen hold, or adjust the store velocity multiplier in the engine.
- **Macro UI (`CapacityTable` + `CapacityRow`):** each store renders TWO side-by-side indicators —
  - **Indicator 1 · Physical Space:** radial capacity gauge % + stacked inventory bar (On Hand / On Order / In Transit / New Allocation) with a 100% ceiling marker and red diagonal hatching for overflow units.
  - **Indicator 2 · Total Store Velocity:** aggregate `Store WOS = (total replen On-Hand + On-Order + In Transit + New Allocation) / total forecasted weekly replen sales`, plotted against the 2–16 healthy band with status chips **Bloated (>20 WOS)** / **Slow Turn (>16 WOS)** / **Rapid Turn (<2 WOS)** and a capital-lockup readout.
  - **Macro action triggers:** contextual tags — **Trim Allocation**, **Freeze Auto-Replen**, **Adjust Store Multiplier**.
  - **Dual-breach** stores carry a pulsing **Critical · Dual Breach** badge.
- **Row schema:** `{ id, name, tier, plans, capacity, onHand, onOrder, inTransit, newAllocation, weeklySales, storeWos, note }`
- **Ranking:** Primary = dual breach (physical ≥ 100% AND velocity bound); Secondary = total overflow units; Tertiary = Store WOS deviation from band. Display capped at **Top 10 of M** with the "Export full list" footer.

---

## 5. FWOS < 1 (Forward Weeks of Supply) Flags

FWOS < 1 = a plan has stores with less than one forward week of supply — imminent stockout. Surfaced two ways:

1. **KPI line** on *Demand Unmet Rate*: "23 of 141 stores under 1-wk cover".
2. **Per-plan flag chip** in the Evidence metrics row (`FwosFlag` in `InsightsStudio.jsx`) — glowing rose→red pill with pinging dot + at-risk store count. Renders only when `fwos < 1`.

Data: `worklist[]` fields `fwos` + `fwosStores`.

| Plan | FWOS | Stores at risk | Status | Flagged? |
|------|------|----------------|--------|----------|
| PLN-104 | 0.4w | 4 | Urgent | ✅ |
| PLN-124 | 0.5w | 6 | Urgent | ✅ |
| PLN-118 | 0.7w | 5 | Urgent | ✅ |
| PLN-127 | 0.8w | 4 | Urgent | ✅ |
| PLN-092 | 0.9w | 8 | Constrained | ✅ |
| PLN-101 | 1.6w | 0 | Constrained | — |
| PLN-108 | 2.1w | 0 | Constrained | — |
| PLN-110 / 115 | — | — | Safe | — |

---

## 6. Data Sources & Helpers (`mockData.js`)

| Export | Feeds |
|--------|-------|
| `triage` | Triage Ribbon counts |
| `validationChecks[]` | Triage Ribbon check table |
| `kpis[]` | Overview cards |
| `playbook[]` | Action narratives (What → Why → Next) merged into cards |
| `insights[]` | Insight evidence directories |
| `insightCards[]` | Merged action + evidence cards (join of the two above) |
| `worklist[]` | Plan-level metrics (rate, unmet, revenue, status, fwos, fwosStores) |
| `getPlanMeta(id)` | Looks up a plan's metrics for the evidence rows |
| `buildInsightExport(bucketId)` | Shared CSV export for every insight card |
| `getWorklistSummary(excludeIds)` | Risked vs safe rollup (unmet + revenue totals) |

---

## 7. Plan → Insight Cross-Reference

| Plan | Appears in | Status | FWOS |
|------|-----------|--------|------|
| PLN-092 | Pack Config | Constrained | 0.9w ✅ |
| PLN-101 | Max Capping | Constrained | 1.6w |
| PLN-104 | Pack Config | Urgent | 0.4w ✅ |
| PLN-108 | Size Curve | Constrained | 2.1w |
| PLN-118 | Min Constraints | Urgent | 0.7w ✅ |
| PLN-124 | Min Constraints | Urgent | 0.5w ✅ |

---

## Adding a new insight bucket (scales to N dimensions)

The Insights section is data-driven — a new bucket needs **no per-id UI wiring**. To add one:

1. **Append to `insights[]`** in `mockData.js` with:
   - `id`, `title`, `planCount` (or omit), `macro`, `directoryTitle`, `directoryHint`.
   - `tone` — an accent token from the registry (`sky`, `slate`, `rose`, `amber`, `teal`, `indigo`, `violet`, `emerald`, `cyan`, `fuchsia`, `orange`, `blue`). Drives the accent dot.
   - `iconName` — a key from the icon registry (`arrowUp`, `lock`, `puzzle`, `alert`, `ruler`, `warehouse`, `network`, `timer`, `packageX`, `dollar`, `store`, `triangle`, `folder`).
   - `type` — `tree` (Plan → Style-Color → Store), `poTable`, or `capacityTable`.
2. *(Optional)* add a matching **action narrative** in `playbook[]` sharing an `exportBucketId` (it auto-merges into the bucket's card via `insightCards[]`), and a **Triage** check label.
3. If the bucket needs a **new color or icon**, register it once in `ACCENT_DOT` / `ICONS` at the top of `InsightsStudio.jsx` — then it's reusable by every future bucket.

Registries live in `InsightsStudio.jsx`: `ACCENT_DOT` (tone → dot color), `ICONS` (iconName → lucide component), `DRAWER_STYLE` (shared neutral chrome). `buildInsightExport()` handles `tree` / `poTable` / `capacityTable`; a brand-new `type` needs a renderer + an export branch. The current colors/icons already cover **5+ additional buckets** with zero new registration.

---

*Baseline cycle snapshot · read-only diagnostics.*
