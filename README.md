# AutoAllocation Workspace

A production-ready visual diagnostic console for retail allocation cycles. It turns raw allocation logs into an interactive triage workspace built around a clear information architecture.

## Features

- **Workflow Triage Ribbon** — interactive status selectors (All Cycles, Safe, Issues, Urgent) that filter the worklist. Includes the Fast-Track Batch Approve action for clean plans.
- **Core Health KPI Strip** — 4 data hero cards (Units Allocated, DC ATA Consumed, Expected OOS Rate, Revenue at Risk) with contextual hover overlays and warning notes.
- **Alan's Smart Actions Playbook** — What ➔ Why ➔ Next Step diagnostic cards with playbook trigger buttons that auto-open the relevant insight directory.
- **Diagnostic Insights Studio** — read-only cascading directories tracing Plans ➔ Style-Colors ➔ Stores, plus a critical PO draindown table with copy-to-clipboard.
- **System Validation & Quality Checks** — row-by-row status matrix (guardrails, priority inversions, concentration checks).
- **Master Plan Worklist Table** — the baseline action grid with status, allocation-rate bars, selection, filtering, and sorting.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react icons

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5180`.

## Build

```bash
npm run build
npm run preview
```

## Interactive Flows

1. **Resolving Upstream Supply Shortages** — click **Urgent Actions** to filter, open the **DC ATA Over-Drain** drawer, and use the **Copy ID** icon on a PO to fire a success toast.
2. **Analyzing Downstream Constraints** — click **Generate Target Store/Size List** in Playbook Card B to auto-open the **Pack Rounding** tree; hover a store tag to read why units were dropped.
3. **Processing Mixed Plan Cycles** — click **Fast-Track Batch Approve Clean Plans** to dispatch clean runs and refocus the worklist on plans needing manual review.

All data is mock data located in `src/data/mockData.js`.
