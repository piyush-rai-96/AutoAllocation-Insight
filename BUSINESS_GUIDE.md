# AutoAllocation Insights — Business & Implementation Guide

For a **business owner, merchandiser, or allocation lead** evaluating or implementing this console. It explains — in plain language — what the tool is for, what each section contains, every KPI and what it means, the diagnostic buckets, the data you need to feed it, and what to consider for a real rollout.

> **📚 Documentation map** — start here based on who you are:
> - **`AGENT.md`** — full system & technical overview. Start here for the big picture.
> - **`BUSINESS_GUIDE.md`** *(this file)* — business & implementation view: what each section does, all KPIs, data inputs, rollout.
> - **`INSIGHTS.md`** — technical field-level mapping: insight ↔ action ↔ KPI, data sources, "add a bucket" guide.
> - **`OVERVIEW.md`** — one-page plain-language business summary.

---

## 1. The business problem it solves

Auto-allocation engines decide how to spread limited inventory across many stores. They optimize against rules (minimums, ceilings, pack sizes, DC stock, capacity). The result is usually "good enough" in aggregate — but **buried inside are avoidable losses**:

- Slow stores over-filled because of a minimum-stock rule → future markdowns.
- Fast stores starved because of a ceiling or a pack-rounding quirk → lost sales.
- A warehouse quietly runs dry and the engine silently pulls from a backup DC → hidden cost and delay.
- Stores filled past their physical capacity → stock stranded in the backroom.

These are **invisible in a summary report**. This console makes them visible, quantifies the money at stake, ranks the fixes, and lets the allocator act on the exact plan/store/size — in minutes instead of spreadsheet archaeology.

**Who uses it:** allocation analysts (daily triage), merchandise planners (impact + markdown risk), supply/DC planners (DC and capacity constraints), and leadership (cycle health at a glance).

**Where it fits:** *after* the allocation engine runs, *before* dispatch/commitment. It is a **review-and-recommend layer**, not the allocator itself. It is **read-only** by design.

---

## 2. How to read the console (top to bottom)

The screen is three stacked sections, ordered the way an operator works: **triage → measure → decide & drill in.**

| # | Section | Purpose (business) | What you do here |
|---|---------|--------------------|------------------|
| 1 | **Triage Ribbon** | Is this cycle healthy? How many plans need attention? | Filter to "Plans with Issues" and jump straight to them |
| 2 | **Overview (KPIs)** | How big is the problem, in units and dollars? | Read the 5 health metrics + urgency flags |
| 3 | **Insights & Smart Actions** | What should I do, and what's the evidence? | Read ranked What → Why → Next-Step cards, then open **View affected plans & stores** to drill down, copy IDs/POs, export CSV |

---

## 3. Section 1 — Triage Ribbon (cycle scorecard)

Three headline cards that also act as filters:

| Card | This cycle | Meaning |
|------|-----------|---------|
| **Total Plans** | 10 | All active allocation plans (covers 20 products / 141 stores) |
| **No Issues / Safe** | 2 | Plans with no shortfalls or alerts |
| **Plans with Issues** | 8 | Constrained or over-allocated — needs review (4 are urgent) |

Clicking a card **filters the Insights section** to just those plans and scrolls to it.

**Diagnostic checks** (run against every plan): the ribbon lists the 6 checks the engine output is screened against — Min Constraints, Max Capping, Pack Config, DC Inventory & Multi-DC Sourcing, Store Capacity & Total Store Velocity, Size Curve Deviation. Each check maps to an insight bucket (Section 6).

---

## 4. Section 2 — The KPIs (what each one means)

Five cards. Each shows a headline value, supporting detail, a mini trend, and a change vs. prior cycles. **Amber ⚠ = attention warranted.**

| KPI | This cycle | Plain-language meaning | Why it matters | Watch when… |
|-----|-----------|------------------------|----------------|-------------|
| **Units Allocated** | 5,894 | Total units committed to stores (53.8% of the 10,957 demand pool) | Overall throughput of the cycle | It diverges sharply from demand pool |
| **DC Consumption & Sourcing** | 9.3% ⚠ | % of warehouse available-to-allocate used, **plus** the sourcing story: main DC (DC-01) is over-drawn at **112%**, so **1,240 units (21%)** are pulled from a backup DC (DC-02) | Signals a supply squeeze and hidden cross-DC cost/lead time | Primary DC exceeds ~100% or fallback share climbs |
| **Demand Unmet Rate** | 47.6% ⚠ | Share of demand that would go unfilled as things stand (only 52.4% met); rising 3 cycles | The headline "are we losing sales?" number | It trends up or FWOS flags grow |
| **Revenue at Risk** | $221.00 | Estimated sales lost if flagged plans ship unresolved (4 high-exposure stores) | Translates the problem into money | Any non-trivial dollar figure appears |
| **Stores Near Capacity** | 9 | Stores whose projected fill nears/exceeds physical capacity (2 already over 100%) | Overfill strands stock in the backroom | Count grows or any store exceeds 100% |

### The urgency signal: FWOS < 1
**FWOS = Forward Weeks of Supply.** When a store has **less than one week** of stock, it's about to sell out. **23 of 141 stores** are currently under one week of cover. These are flagged directly on the affected plans so the allocator acts on the leading edge of lost sales first.

---

## 5. Section 3 — Insights & Smart Actions (what to do + the evidence)

One card per issue, ordered by severity (Critical first). Each card opens in layers so leaders can read the recommendation and analysts can drill into the proof — in the same place:

1. **Collapsed** — the issue title, a severity chip, the lost-sales estimate, and a one-line *What*.
2. **Action** (on expand) — the recommendation, written as:
   - **What's happening** — the mechanical cause.
   - **Why it matters** — the business consequence (units, markdown/lost-sales exposure).
   - **What to do next** — a concrete, soft-recommended action.
   - a one-click **Export** of the affected work list.
3. **Evidence** (nested **View affected plans & stores** toggle) — a macro-impact line and the drill-down directory (see Section 6).

So "read the recommendation → drill into the evidence → export the list" is a single, uninterrupted flow within one card.

---

## 6. The six insight buckets (the diagnoses)

Each bucket is a diagnosed root cause, surfaced as the **Evidence** layer of its card. It shows a macro-impact line, a drill-down directory, and an export.

| Bucket | Severity | What it means for the business | Recommended action |
|--------|----------|--------------------------------|--------------------|
| **Min Constraints** | Critical | Minimum-stock rules pushed **+1,606 units** into slow stores while fast stores went short | Relax floors where sales are < 1 unit/week |
| **Max Capping** | Warning | Store ceilings held back **190 sellable units** | Raise ceilings where demand + stock support it |
| **Pack Config** | Warning | Case-pack rounding blocked **6,977 units** — the main driver of the 47.6% unmet rate | Review pack-rounding config (e.g. round to nearest pack) |
| **DC Inventory & Multi-DC Sourcing** | Critical | Main DC over-drawn at 112% and out on core styles; **1,240 units** rerouted from a backup DC | Confirm backup DC can spare it; trace to inbound POs; hold plans on the over-drawn DC |
| **Size Curve** | Warning | One plan over-shipped XL and under-shipped Small | Store-to-store transfer to cover Small, or fix the constraint |
| **Store Capacity & Total Store Velocity** | Critical | Macro store health: 12 stores flagged — 5 over physical capacity (1,842 overflow units) and 4 bloated (>20 WOS); 3 breach both | Trim/stagger allocation, freeze store-wide auto-replen, or adjust the store velocity multiplier before dispatch |

### Two signature views worth calling out
- **Multi-DC Sourcing Flow** — visually shows the primary DC drawn past its safe bound feeding a secondary-DC fallback, so supply planners immediately see the hidden cross-DC dependency and cost.
- **Macro Store Health (Store Capacity & Total Store Velocity)** — each store is evaluated as a total entity on two side-by-side indicators: **Physical Space** (radial gauge + stacked On Hand / On Order / In Transit / New Allocation bar against a 100% ceiling with red overflow hatching) and **Total Store Velocity** (aggregate Store WOS vs. the 2–16 healthy band, flagging Bloated >20 WOS / Slow >16 WOS / Rapid <2 WOS). Dual-breach stores escalate to Critical and expose macro action tags (Trim Allocation, Freeze Auto-Replen, Adjust Store Multiplier).

---

## 7. Where the money is (executive read)

- **Biggest unmet volume:** Pack Config (6,977 units held up).
- **Biggest markdown risk:** Min Constraints (~$1,606 of stock stuck in slow stores).
- **Most urgent stockouts:** 5 plans with stores under one week of supply.
- **Hidden supply exposure:** 1,240 units (21% of draw) rerouted from a backup DC.
- **Overfill risk:** 5 stores over physical capacity (1,842 overflow units); 4 bloated (>20 WOS) locking ~$530K working capital.

---

## 8. What data you need to feed it (implementation inputs)

To run this against real cycles, the engine output must provide the following. (Today these live as a mock module; in production they'd come from the allocation engine + master data.)

| Data domain | Fields needed | Feeds |
|-------------|---------------|-------|
| **Plans** | plan id, products, stores, allocation rate, unmet volume, revenue at risk, status | Triage, KPIs, Insights |
| **Plan → Style-Color → Store → Size** | hierarchy with per-store units, sizes, and a system note explaining the constraint | Insights evidence tree drill-down |
| **FWOS** | forward weeks of supply per plan + count of at-risk stores | Urgency flags |
| **DC inventory** | per-DC available-to-allocate, drawn %, safe bound, primary/secondary assignment, fallback units | DC bucket + Multi-DC flow + KPI |
| **Purchase orders** | PO number, ETA, channel, linked style-color | DC bucket rows |
| **Store macro health** | per-store tier/cluster, capacity ceiling, on hand, on order, in transit, new allocation, weekly replen sales, aggregate Store WOS | Store Capacity & Total Store Velocity bucket + KPI |
| **Constraint metadata** | min floors, max caps, pack sizes, size-curve baselines | Diagnostic checks + notes |

**Rule of thumb:** each KPI, action narrative, and bucket is fully data-driven — supplying the fields above lights up the whole console with no code changes.

---

## 9. Extending it (new dimensions / metrics)

The console is built to **scale to more diagnostic dimensions** without re-engineering:

- **New insight bucket** (e.g. "Priority Inversion", "Single-Store Concentration") — add one data object with a color, an icon, and a layout type. No UI wiring needed; ~5+ more buckets already have colors/icons reserved. (Recipe in `INSIGHTS.md`.)
- **New KPI** — add one card object (value, trend, accent, tooltip).
- **New action narrative** — add one `playbook` entry sharing an `exportBucketId` with its bucket; it merges into the bucket's card automatically.

This means the tool can grow with your allocation policy — as you add rules, you add the matching diagnostic with minimal effort.

---

## 10. Rollout considerations (for a real implementation)

- **Integration point:** hook it to the allocation engine's post-run output (batch export or API). It reads a snapshot; it does not need write access.
- **Refresh cadence:** one snapshot per allocation cycle/run is sufficient; the UI is deterministic per snapshot.
- **Access model:** read-only diagnostics — safe to give broad visibility (analysts, planners, leadership).
- **Actioning:** current version recommends and exports (CSV/clipboard) for use in the procurement/allocation tools of record. A future phase could write back approved actions (e.g., relax a floor, expedite a PO) — deliberately out of scope today to keep it a trustworthy review layer.
- **Thresholds:** severity bands (e.g., DC over 100%, capacity ≥ 90% "near" / ≥ 100% "over", FWOS < 1) should be made configurable per business.
- **Scale:** long lists are capped to the **top 10 plans / top 5 style-colors / top 5 stores** (ranked by impact) with a full-list export, so the view stays fast and scannable at enterprise data volumes.

---

## 11. What it does *not* do (scope guardrails)

- It does **not** re-run or change the allocation — it explains and recommends.
- It does **not** place POs or transfers — it hands you the exact list to action elsewhere.
- It is a **single-cycle snapshot** view today (no multi-cycle history beyond the KPI trend sparkline).

---

*Baseline cycle snapshot · read-only diagnostics. For field-level detail see `INSIGHTS.md`; for the technical system overview see `AGENT.md`.*
