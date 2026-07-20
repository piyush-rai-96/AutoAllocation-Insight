# AutoAllocation Insights — Insight Specification

A reference map of every diagnostic Insight in the console: which **UI section** surfaces it, which **KPI** it drives, its paired **Playbook action**, the **data source**, **severity**, and **FWOS** (Forward Weeks of Supply) impact.

> Source of truth: `src/data/mockData.js`. UI: `src/components/*`. This doc mirrors the mock dataset for the baseline cycle snapshot.

> **📚 Documentation map** — start here based on who you are:
> - **`AGENT.md`** — full system & technical overview. Start here for the big picture.
> - **`BUSINESS_GUIDE.md`** — business & implementation view: what each section does, all KPIs, data inputs, rollout.
> - **`INSIGHTS.md`** *(this file)* — technical field-level mapping: insight ↔ playbook ↔ KPI, data sources, "add a bucket" guide.
> - **`OVERVIEW.md`** — one-page plain-language business summary.

---

## 1. Console Sections (top → bottom)

Rendered by `src/App.jsx` inside `<main>`:

| Order | Section | Component | Purpose |
|------|---------|-----------|---------|
| 1 | **Triage Ribbon** | `TriageRibbon.jsx` | Cycle-level counts + validation checks; filters into the Handbook |
| 2 | **Overview (KPIs)** | `KpiStrip.jsx` | 5 core health metrics at a glance |
| 3 | **Alan's Smart Actions Playbook** | `Playbook.jsx` | Prioritized, collapsible What → Why → Next-Step action cards |
| 4 | **Insight Handbook** | `InsightsStudio.jsx` | Expandable diagnostic directories drilling Plan → Style-Color → Store |

**Handbook display caps (top-N + export):** plan-tree drawers show the **top 10 plans** (ranked by revenue at risk), each plan the **top 5 style-colors**, each style-color the **top 5 stores**. When a list exceeds its cap, a *"Showing top N of M — Export full list"* footer appears (only when truncated) that copies the complete bucket CSV via `buildInsightExport()`. Constants: `MAX_PLANS` / `MAX_STYLES` / `MAX_STORES` in `InsightsStudio.jsx`. The DC PO table and Store Capacity table are left uncapped (already short, high-signal rows).

---

## 2. Overview KPIs

Data: `kpis[]` in `mockData.js`. Rendered as cards in `KpiStrip.jsx`.

| KPI (id) | Value | Accent | Supporting lines | Drives / relates to |
|----------|-------|--------|------------------|---------------------|
| Units Allocated (`units`) | 5,894 | slate | Rate 53.8%, Demand Pool 10,957 | Overall throughput |
| DC Consumption & Sourcing (`ata`) | 9.3% | amber | 5,894 / 63,108 drawn · 57,214 left; ⚠ **Primary DC-01 over-bound 112%**; Fallback 1,240u (21%) from DC-02 | **DC Inventory & Multi-DC Sourcing** insight |
| Demand Unmet Rate (`oos`) | 47.6% | rose | Demand Met 52.4%; ⚠ **FWOS < 1**: 23 of 141 stores under 1-wk cover; ⚠ 3-run increase | **Pack Config**, all under-allocation insights |
| Revenue at Risk (`revenue`) | $221.00 | violet | 2.00 est. lost units; 4 high-exposure stores | **Pack Config**, **DC Inventory** |
| Stores Near Capacity (`storesNearCapacity`) | 9 | indigo | Of 141 stores; ⚠ 2 project over 100% fill | **Store Capacity Soft Constraint** insight |

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
| Store Capacity Soft Breach | FLAGGED | MEDIUM | 3 | 9 stores project On Hand+On Order+In Transit+New Alloc near/over capacity |
| Size Curve Deviation | CLEAR | NONE | 0 | Distributions match baseline |

**Diagnostic checks tooltip (Triage "Plans with Issues"):** 6 checks — Min Constraints, Max Capping, Pack Config, DC Inventory & Multi-DC Sourcing, Store Capacity Soft Constraint, Size Curve Deviation.

---

## 4. Insight ↔ Playbook ↔ KPI Master Map

Each **Insight Handbook** bucket (`insights[]`) pairs with a **Playbook** card (`playbook[]`) via a shared `exportBucketId`. Both export the same CSV rows through `buildInsightExport()`.

### A. Min Constraints Influencing Allocation
- **Insight id:** `minConstraints` · **Playbook:** `cardMinConstraints`
- **Severity:** Critical · **Tone:** sky · **Type:** tree
- **Scope:** 3 plans · 1,194 SKU-Store-Size combos · 1,606 excess units over-allocated
- **Related KPI:** Units Allocated (over-allocation), Demand Unmet Rate (starved flagship stores)
- **What:** Binding minimum floors force allocation above true localized demand.
- **Why:** Slow channels trap stock, risking markdowns while high-velocity stores starve.
- **Next step:** Relax/waive floors where min > 1 but trailing sales < 1 unit/week.
- **Lost sales:** ~$1,606 markdown exposure
- **Plans:** PLN-118 (+980u), PLN-124 (+626u)

### B. Max Capping Allocation
- **Insight id:** `maxCapping` · **Playbook:** `cardMaxCapping`
- **Severity:** Warning · **Tone:** slate · **Type:** tree
- **Scope:** 2 plans · 312 combos at ceiling · 190 units throttled
- **Related KPI:** DC ATA Consumed (parked stock), Demand Unmet Rate
- **What:** Store-level ceilings throttled 312 combos, holding 190 units.
- **Why:** Max-cap guardrails stopped allocation short of localized demand.
- **Next step:** Raise/waive ceilings where DC availability + demand support more.
- **Lost sales:** ~$190 deferred demand
- **Plans:** PLN-101 (-190u)

### C. Pack Config → Under / Over Allocation
- **Insight id:** `packConfig` · **Playbook:** `cardPackConfig`
- **Severity:** Warning · **Tone:** amber · **Type:** tree
- **Scope:** 7 plans · 1,271 combos · 6,977 units off pack multiple
- **Related KPI:** **Demand Unmet Rate (47.6%)**, Revenue at Risk ($221)
- **What:** Pack-size rounding blocks 6,977 units across 7 runs.
- **Why:** Rounding between case-pack multiples creates an artificial 47.6% OOS rate.
- **Next step (soft):** *Review* pack-rounding config — consider "Hard Floor" → "Round to Nearest Pack" if policy allows.
- **Lost sales:** ~$221.00 revenue at risk
- **Plans:** PLN-092 (-4,156u), PLN-104 (-450u)

### D. DC Inventory & Multi-DC Sourcing
- **Insight id:** `dcInventory` · **Playbook:** `cardDcInventory`
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
- **Insight id:** `sizeCurve` · **Playbook:** `cardSizeCurve`
- **Severity:** Warning · **Tone:** amber · **Type:** tree
- **Scope:** 1 plan · shipped profile deviates from baseline
- **Related KPI:** Revenue at Risk (sell-through erosion)
- **What:** Over-allocated XL / under-allocated Small at the affected store.
- **Why:** Oversupplied sizes get marked down; undersupplied sizes stock out.
- **Next step:** Check existing store inventory for a **store-to-store (S2S) transfer** to cover Small — or review binding constraints to confirm the skew is fixable at source.
- **Lost sales:** Sell-through risk
- **Plans:** PLN-108

### F. Store Capacity Soft Constraint
- **Insight id:** `storeCapacity` · **Playbook:** `cardStoreCapacity`
- **Severity:** Warning (escalates to critical when util ≥ 100%) · **Tone:** amber · **Type:** capacityTable · **Badge:** SOFT LIMIT NEARING
- **Scope:** 3 plans · 9 of 141 stores nearing/over capacity
- **Related KPI:** **Stores Near Capacity (9)**
- **What:** Projected fill (On Hand + On Order + In Transit + New Allocation) is nearing/exceeding physical store capacity — a soft-constraint breach allocation did not hard-stop.
- **Why:** Capacity is a soft limit, so the runner can allocate past it; overfilled stores strand stock in the backroom instead of on the floor.
- **Next step:** Trim/stagger new allocation, or set up a store-to-store transfer to relieve overfill before dispatch.
- **Lost sales:** Fill / handling risk
- **Capacity UI:** `CapacityTable` — per-store stacked bar (On Hand / On Order / In Transit / New Allocation) against a dashed 100% ceiling; **Over Capacity** (rose, pulsing) / **Near Capacity** (amber) / **Within Limit** (emerald) status chip with utilization %.
- **Rows:** ks001a04 (over by 480u), ks007a03 (95.6%), ks010a02 (over by 80u), ks016a03 (88.0%)

---

## 5. FWOS < 1 (Forward Weeks of Supply) Flags

FWOS < 1 = a plan has stores with less than one forward week of supply — imminent stockout. Surfaced two ways:

1. **KPI line** on *Demand Unmet Rate*: "23 of 141 stores under 1-wk cover".
2. **Per-plan flag chip** in the Handbook metrics row (`FwosFlag` in `InsightsStudio.jsx`) — glowing rose→red pill with pinging dot + at-risk store count. Renders only when `fwos < 1`.

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
| `playbook[]` | Playbook action cards |
| `insights[]` | Insight Handbook directories |
| `worklist[]` | Plan-level metrics (rate, unmet, revenue, status, fwos, fwosStores) |
| `getPlanMeta(id)` | Looks up a plan's metrics for the Handbook rows |
| `buildInsightExport(bucketId)` | Shared CSV export for Playbook + Handbook |
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

The Handbook is data-driven — a new bucket needs **no per-id UI wiring**. To add one:

1. **Append to `insights[]`** in `mockData.js` with:
   - `id`, `title`, `planCount` (or omit), `macro`, `directoryTitle`, `directoryHint`.
   - `tone` — an accent token from the registry (`sky`, `slate`, `rose`, `amber`, `teal`, `indigo`, `violet`, `emerald`, `cyan`, `fuchsia`, `orange`, `blue`). Drives the accent dot.
   - `iconName` — a key from the icon registry (`arrowUp`, `lock`, `puzzle`, `alert`, `ruler`, `warehouse`, `network`, `timer`, `packageX`, `dollar`, `store`, `triangle`, `folder`).
   - `type` — `tree` (Plan → Style-Color → Store), `poTable`, or `capacityTable`.
2. *(Optional)* add a matching **Playbook** card in `playbook[]` sharing an `exportBucketId`, and a **Triage** check label.
3. If the bucket needs a **new color or icon**, register it once in `ACCENT_DOT` / `ICONS` at the top of `InsightsStudio.jsx` — then it's reusable by every future bucket.

Registries live in `InsightsStudio.jsx`: `ACCENT_DOT` (tone → dot color), `ICONS` (iconName → lucide component), `DRAWER_STYLE` (shared neutral chrome). `buildInsightExport()` handles `tree` / `poTable` / `capacityTable`; a brand-new `type` needs a renderer + an export branch. The current colors/icons already cover **5+ additional buckets** with zero new registration.

---

*Baseline cycle snapshot · read-only diagnostics.*
