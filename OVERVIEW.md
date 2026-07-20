# AutoAllocation Insights — Business Overview

A plain-language guide to what the console shows and the numbers that matter. No jargon.

> **📚 Documentation map** — start here based on who you are:
> - **`AGENT.md`** — full system & technical overview. Start here for the big picture.
> - **`BUSINESS_GUIDE.md`** — business & implementation view: what each section does, all KPIs, data inputs, rollout.
> - **`INSIGHTS.md`** — technical field-level mapping: insight ↔ playbook ↔ KPI, data sources, "add a bucket" guide.
> - **`OVERVIEW.md`** *(this file)* — one-page plain-language business summary.

---

## What this console does

It reviews how this cycle's inventory was allocated across stores, flags where demand won't be met, and recommends the actions that recover the most sales.

**This cycle at a glance:** 10 active plans · 20 products · 141 stores.

---

## The 5 headline KPIs

| KPI | This cycle | What it tells you |
|-----|-----------|-------------------|
| **Units Allocated** | 5,894 | How much inventory we committed to stores — 53.8% of the 10,957-unit demand pool. |
| **DC Consumption & Sourcing** | 9.3% ⚠ | Warehouse stock used this cycle, plus the sourcing story: the main DC (DC-01) is over-drawn at 112%, so 1,240 units (21%) are pulled from a backup DC. |
| **Demand Unmet Rate** | 47.6% ⚠ | Share of demand that would go unfilled as things stand. Only 52.4% of demand is met, and it has risen 3 cycles running. |
| **Revenue at Risk** | $221.00 | Sales we could lose if flagged plans ship unresolved — concentrated in 4 high-exposure stores. |
| **Stores Near Capacity** | 9 | Stores whose projected fill is nearing/over their physical limit — 2 already project over 100%. |

### The urgency signal: FWOS < 1
**FWOS** = Forward Weeks of Supply. When a store has **less than one week** of stock left, it's about to sell out.

- **23 of 141 stores** are currently under one week of cover.
- These stores are flagged directly on the affected plans so you can act first.

---

## What's inside — the 4 sections

1. **Triage Ribbon** — the cycle scorecard: how many plans are safe, at issue, or urgent, plus 6 automated health checks.
2. **Overview** — the 5 KPIs above.
3. **Smart Actions Playbook** — the recommended fixes, ranked, each written as *What's happening → Why it matters → What to do next*.
4. **Insight Handbook** — the detail view: drill from a plan down to the exact store and size behind each issue, and export the list.

---

## The 6 issues we found (and the fix)

| # | Issue | Severity | In short | Recommended action |
|---|-------|----------|----------|--------------------|
| A | **Min Constraints** | Critical | Minimum-stock rules pushed 1,606 extra units into slow stores while fast stores went short. | Relax floors where sales are below 1 unit/week. |
| B | **Max Capping** | Warning | Store ceilings held back 190 sellable units. | Raise ceilings where demand and stock both support it. |
| C | **Pack Config** | Warning | Case-pack rounding blocked 6,977 units — the main driver of the 47.6% unmet rate. | Review pack-rounding settings; consider rounding to the nearest pack. |
| D | **DC Inventory & Multi-DC Sourcing** | Critical | Main DC (DC-01) is over-drawn at 112% and out on core styles, so 1,240 units are now pulled from a backup DC. | Confirm the backup DC can spare the draw; trace to incoming POs (Jul 28 – Aug 02); hold plans on the over-drawn DC. |
| E | **Size Curve** | Warning | One plan over-shipped XL and under-shipped Small. | Check for a store-to-store transfer to cover Small, or review the constraints. |
| F | **Store Capacity** | Warning | 9 stores are projected to fill near/over their physical capacity (On Hand + On Order + In Transit + New Allocation). | Trim or stagger the new allocation, or transfer stock between stores before dispatch. |

---

## Where the money is

- **Biggest unmet volume:** Pack Config (6,977 units held up).
- **Biggest markdown risk:** Min Constraints (~$1,606 of stock stuck in slow stores).
- **Most urgent stockouts:** plans PLN-104, PLN-124, PLN-118, PLN-127, PLN-092 — all with stores under one week of supply.
- **Cross-DC exposure:** 1,240 units (21% of the draw) rerouted from the backup DC because the main DC is over-drawn.
- **Overfill risk:** 9 stores nearing capacity, 2 already projecting over 100% fill.

---

*Baseline cycle snapshot · read-only. For the technical field-level mapping, see `INSIGHTS.md`.*
