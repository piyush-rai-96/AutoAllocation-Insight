// Central mock dataset for the AutoAllocation Workspace.
// Mirrors the numbers described in the product blueprint.

export const triage = {
  allCycles: {
    count: 10,
    label: 'Active Plans',
    subtext: 'Across 20 products this cycle',
    styleColors: 64,
    stores: 141,
    scopeLabel: 'in scope',
  },
  safe: {
    historical: 0,
    simulated: 2,
    subtext: '0 shortfalls or alerts',
    styleColors: 5,
    stores: 30,
    scopeLabel: 'clean',
  },
  issues: {
    count: 8,
    subtext: 'Constrained or Over-Allocated',
    styleColors: 59,
    stores: 111,
    scopeLabel: 'impacted',
  },
  urgent: {
    count: 4,
    subtext: 'Safety Buffer Breaches Detected',
  },
}

export const kpis = [
  {
    id: 'units',
    icon: 'Package',
    title: 'Units Allocated',
    metric: 'Total Units Allocated',
    value: '5,894',
    accent: 'slate',
    lines: [
      { label: 'Allocation Rate', value: '53.8%' },
      { label: 'Total Demand Requirement', value: '10,957 units' },
    ],
    spark: [42, 48, 45, 52, 50, 58, 54],
    delta: '+6.2%',
    deltaDir: 'up',
    deltaNote: 'vs 7-day avg',
    tooltip: 'Total units committed across all active allocation runs in this cycle.',
  },
  {
    id: 'ata',
    icon: 'Factory',
    title: 'DC Consumption & Sourcing',
    metric: 'Warehouse ATA Utilized %',
    value: '9.3%',
    accent: 'amber',
    warning:
      'System Flag: Primary DC (DC-01 · North) is fully consumed (100%) and exhausted; allocation is falling back to DC-02 · Central to keep plans moving.',
    lines: [
      { label: 'Drawn vs Remaining ATA', value: '5,894 drawn · 57,214 left (of 63,108)' },
      { label: 'Primary DC Exhausted', value: '100% · DC-01 · North (exhausted)', warn: true },
      { label: 'Secondary DC Exhausted', value: '21% · DC-02 · Central (1,240u fallback)' },
    ],
    spark: [4, 5, 6, 6, 7, 8, 9.3],
    delta: '+2.1pp',
    deltaDir: 'up',
    deltaNote: 'vs 7-day avg',
    tooltip:
      'Share of distribution-center Available-To-Allocate inventory consumed this cycle, plus the cross-DC fallback: when the primary DC is over-bound or exhausted, allocation draws from a secondary DC (added lead time and handling cost).',
  },
  {
    id: 'oos',
    icon: 'AlertTriangle',
    title: 'Demand Unmet Rate',
    metric: 'Unfilled Demand %',
    value: '47.6%',
    trend: 'up',
    accent: 'rose',
    lines: [
      { label: 'Demand Met', value: '52.4%' },
      { label: 'Low-Stock Stores (FWOS < 1)', value: '23 of 141 stores', warn: true },
    ],
    spark: [31, 34, 38, 40, 42, 45, 47.6],
    delta: '+2.6pp',
    deltaDir: 'up',
    deltaNote: 'vs 7-day avg',
    overlay: { unmetUnits: '6,979', label: 'Unmet Units' },
    tooltip:
      'Share of demand that would go unmet if plans dispatch as currently constrained. FWOS < 1 flags stores with less than one forward week of supply — the leading edge of unmet demand.',
  },
  {
    id: 'revenue',
    icon: 'DollarSign',
    title: 'Revenue at Risk',
    metric: 'Total Est. Lost Sales ($)',
    value: '$221.00',
    accent: 'violet',
    lines: [
      { label: 'Est. Lost Volume', value: '2 units' },
      { label: 'High-Exposure Stores', value: '4 stores' },
    ],
    spark: [120, 145, 160, 180, 195, 210, 221],
    delta: '+8.9%',
    deltaDir: 'up',
    deltaNote: 'vs 7-day avg',
    tooltip: 'Estimated revenue exposure from unmet demand across flagged stores.',
  },
  {
    id: 'storesNearCapacity',
    icon: 'Warehouse',
    title: 'Store Capacity Risk',
    metric: 'At-Risk Store Count',
    value: '9',
    accent: 'indigo',
    lines: [
      { label: 'Total Cycle Stores', value: '141 stores' },
      { label: 'Capacity Breach (>100% Fill)', value: '3 stores · 107% peak', warn: true },
    ],
    spark: [2, 3, 4, 5, 6, 8, 9],
    delta: '+3 stores',
    deltaDir: 'up',
    deltaNote: 'vs 7-day avg',
    overlay: { title: 'Capacity Watch', unmetUnits: '9', label: 'Stores at / over capacity' },
    tooltip:
      'Stores where projected fill (On Hand + On Order + In Transit + New Allocation) is nearing or exceeding capacity — a soft-constraint breach that can strand stock in the backroom.',
  },
]

export const playbook = [
  {
    id: 'cardMinConstraints',
    severity: 'critical',
    title: 'Min Constraints Influencing Allocation',
    what:
      '1,194 product-store-size combinations are over-allocated by 1,606 excess units where binding minimum floor rules force allocation above true localized demand.',
    why:
      'Minimum floors push inventory into slow-selling retail channels beyond what they can sell, trapping stock and risking margin markdowns while starving high-velocity flagship stores.',
    next:
      'Review combinations where the minimum floor is set to >1 while trailing sales average below <1 unit per week, then relax or waive those floors.',
    lostSales:
      '1,606 excess units mislocated at slow channels while high-velocity flagship stores are starved, risking end-of-cycle markdowns on trapped stock.',
    lostSalesValue: '~$1,606 markdown exposure',
    trigger: 'Export the Min-Constrained Plans List',
    exportBucketId: 'minConstraints',
  },
  {
    id: 'cardMaxCapping',
    severity: 'warning',
    title: 'Max Capping Allocation',
    what:
      '2 plans hit configured store-level ceilings, throttling 312 combinations and holding back 190 units at max-capped outlets before demand was satisfied.',
    why:
      'Max-cap guardrails stopped allocation short of localized demand, so available DC stock stays parked instead of reaching capped outlets that could still sell it.',
    next:
      'Review whether each max cap reflects current store capacity; raise or waive ceilings where both DC availability and demand support additional units.',
    lostSales:
      '190 units held behind store ceilings at otherwise-healthy outlets, deferring sellable demand into the next replenishment cycle.',
    lostSalesValue: '~$190 deferred demand',
    trigger: 'Export the Max-Capped Plans List',
    exportBucketId: 'maxCapping',
  },
  {
    id: 'cardPackConfig',
    severity: 'warning',
    title: 'Pack Config → Under / Over Allocation',
    what:
      'Pack-size rounding is preventing 6,977 units from distributing across 7 runs (1,271 combinations) — rounding down starves demand while rounding up over-ships slow channels.',
    why:
      'The allocation runner drops or adds units when regional demand lands between full case-pack multiples, causing an artificial 47.6% OOS rate despite safety stock availability.',
    next:
      'Recommendation: review the pack-rounding configuration for these items — consider moving from "Hard Floor" rounding toward "Round to Nearest Pack" if it fits policy, so shipments track demand more closely.',
    lostSales:
      '2.00 est. lost units across 4 high-exposure stores if the 7 impacted plans dispatch unresolved, driven by the artificial 47.6% OOS rate.',
    lostSalesValue: '~$221.00 revenue at risk',
    trigger: 'Export the Pack-Config Plans List',
    exportBucketId: 'packConfig',
  },
  {
    id: 'cardDcInventory',
    severity: 'critical',
    title: 'DC Inventory & Multi-DC Sourcing',
    what:
      'The primary DC (DC-01 · North) is over-bound at 112% and exhausted on core styles, so allocation has fallen back to a secondary DC (DC-02 · Central) — 1,240 units (21% of the draw) are now sourced cross-DC across 4 plans and 16 product-store combinations.',
    why:
      'When the primary DC drains below buffer or drives past its safe bound, the runner reaches into a secondary DC to keep plans moving. That fallback masks the underlying shortfall and adds cross-DC lead time and handling cost.',
    next:
      'Review each cross-DC fallback: confirm the secondary DC can spare the draw, trace exhausted components to their pending POs (ETA Jul 28 – Aug 02), and hold or reprioritize plans that depend on the over-bound primary DC.',
    lostSales:
      'Unmet demand across 4 high-exposure stores until inbound POs replenish the primary DC; 1,240 units carry added cross-DC lead time from the secondary fallback.',
    lostSalesValue: '~$221.00 revenue at risk',
    trigger: 'Export the DC-Constrained Components List',
    exportBucketId: 'dcInventory',
  },
  {
    id: 'cardSizeCurve',
    severity: 'warning',
    title: 'Size Curve Deviation',
    what:
      '1 plan shipped a size profile that deviates from baseline store demand history — over-allocating XL while under-allocating Small at the affected store.',
    why:
      'Skewed size curves put the wrong sizes on shelf: oversupplied sizes get marked down while undersupplied sizes stock out, eroding full-price sell-through on both ends.',
    next:
      'Before re-balancing the size curve, check existing store inventory for a store-to-store (S2S) transfer to cover the Small shortfall — or review the binding constraints to confirm the skew is fixable at the source.',
    lostSales:
      'Small stock-outs and XL overstock at the affected store cut into full-price sell-through across the size run.',
    lostSalesValue: 'Sell-through risk',
    trigger: 'Export the Skewed Size Curve List',
    exportBucketId: 'sizeCurve',
  },
  {
    id: 'cardStoreCapacity',
    severity: 'critical',
    title: 'Store Capacity & Total Store Velocity',
    what:
      'Stores are evaluated on two separate lenses. Physical Capacity: 5 stores breach backroom capacity (projected On Hand + On Order + In Transit + New Allocation past the ceiling), 1,842 units overflowing. Store Velocity (FWOS): 7 stores need review with thin forward cover (<10 FWOS), 3 sit in the Fine band (10–20), and 4 hold Healthy cover (>20).',
    why:
      'Physical overfill strands stock in backrooms off the sales floor, while thin forward cover (<10 FWOS) exposes stores to store-wide stockouts before the next replenishment lands. Both are macro store-health signals that item-by-item allocation tweaks cannot resolve.',
    next:
      'Work the two lists before dispatch — for over-capacity stores trim or stagger new allocations; for thin-cover (Needs Review) stores review store-wide replenishment or adjust the store velocity multiplier in the engine.',
    lostSales:
      'Overfilled stores strand ~1,842 units in backrooms off the floor, while 7 thin-cover stores risk store-wide stockouts before the next replen cycle.',
    lostSalesValue: 'Fill / Handling Risk + Thin-Cover Risk (7 stores)',
    trigger: 'Export the Macro Store Health List',
    exportBucketId: 'storeCapacity',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// Deep directory generator. Produces a realistic tree so the UI's
// "Top 10 · export all" progressive disclosure is demonstrable at every level:
// 12 plans (top 10 shown), the lead plan carries 12 style-colors, and its lead
// style-color spans 12 stores. Everything below the cap is one export away.
// A single config object lets every tree bucket reuse this generator with its
// own domain phrasing. Plan IDs are reused from the worklist so plan-level
// metric chips (rate / unmet / revenue) still resolve via getPlanMeta.
// ─────────────────────────────────────────────────────────────────────────
const DEEP_GROUPS = ['Fashion Acc', 'Core Acc', 'Seasonal', 'Footwear', 'Denim']
const DEEP_SIZES = ['S, M', 'M, L', 'S, M, L', 'M, L, XL', 'L, XL']
const DEEP_PLAN_IDS = [
  'PLN-092', 'PLN-104', 'PLN-124', 'PLN-127', 'PLN-118', 'PLN-101',
  'PLN-121', 'PLN-108', 'PLN-131', 'PLN-134', 'PLN-137', 'PLN-140',
]

const pad = (n, w = 2) => String(n).padStart(w, '0')

function buildDeepStore(planSeq, styleSeq, i, units, cfg) {
  const seq = `${cfg.idPrefix}${pad(planSeq)}${pad(styleSeq)}${pad(i + 1)}`
  return {
    id: `ks${seq}`,
    name: '000-outlet-store',
    units: `${cfg.sign}${units} units`,
    sizes: DEEP_SIZES[i % DEEP_SIZES.length],
    note: cfg.note(units),
  }
}

function buildDeepStyle(planSeq, styleSeq, storeCount, cfg) {
  const stores = Array.from({ length: storeCount }, (_, i) =>
    buildDeepStore(planSeq, styleSeq, i, cfg.baseUnits - i * 22, cfg),
  )
  const total = Math.abs(stores.reduce((sum, s) => sum + parseNum(s.units), 0))
  return {
    code: `KS10${pad(cfg.codeBase + planSeq * 9 + styleSeq, 4)} ${pad(((styleSeq + 1) * 37) % 999, 3)}`,
    group: DEEP_GROUPS[styleSeq % DEEP_GROUPS.length],
    summary: `${cfg.styleVerb} ${storeCount} ${storeCount === 1 ? 'store' : 'stores'} (${cfg.sign}${total.toLocaleString()} units)`,
    stores,
  }
}

// Build a 12-plan tree; the lead plan is the deep one (12 style-colors, and its
// lead style-color spans 12 stores) so all three Top-10 caps are demonstrable.
function buildDeepPlans(cfg) {
  return DEEP_PLAN_IDS.map((id, p) => {
    const styleCount = p === 0 ? 12 : ((p + 1) % 3) + 1
    const styles = Array.from({ length: styleCount }, (_, s) => {
      const storeCount = p === 0 && s === 0 ? 12 : ((s + p) % 4) + 1
      return buildDeepStyle(p, s, storeCount, cfg)
    })
    const total = Math.abs(
      styles.reduce((sum, st) => sum + st.stores.reduce((a, b) => a + parseNum(b.units), 0), 0),
    )
    const noun = styleCount === 1 ? cfg.clusterNoun : cfg.clusterNounPlural
    return {
      id,
      summary: `Contains ${styleCount} ${noun} | ${cfg.sign}${total.toLocaleString()} ${cfg.unitWord}`,
      styles,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Macro Store Health directory generator (Bucket #6: Store Capacity & Total
// Store Velocity). Produces 14 stores evaluated as total entities on TWO macro
// indicators so the capacityTable can demonstrate the dual-indicator view plus
// the Top-10 ranking with a one-click "export all":
//
//   Indicator 1 — Physical Space: utilization % from
//     (On Hand + On Order + In Transit + New Allocation) vs. store capacity.
//   Indicator 2 — Total Store Velocity: aggregate Store Weeks-of-Supply (WOS)
//     = total replen inventory / total forecasted weekly replen sales.
//     Healthy band is 2–16 WOS; > 16 = Slow Turn (capital lockup),
//     > 20 = Bloated, < 2 = Rapid Turn (stockout risk).
//
// Row shape (capacityTable):
//   { id, name, tier, plans, capacity, onHand, onOrder, inTransit,
//     newAllocation, weeklySales, storeWos, note }
// ─────────────────────────────────────────────────────────────────────────
const CAPACITY_PLAN_IDS = [
  'PLN-092', 'PLN-104', 'PLN-124', 'PLN-118', 'PLN-127', 'PLN-101',
  'PLN-121', 'PLN-108', 'PLN-131', 'PLN-137', 'PLN-092', 'PLN-104',
  'PLN-124', 'PLN-118',
]

// Target physical utilization ratios (projected / capacity), highest first.
const CAPACITY_UTILS = [
  1.19, 1.12, 1.07, 1.04, 1.01, 0.97, 0.955, 0.93, 0.91, 0.90, 0.88, 0.86, 0.83, 0.79,
]

// Aggregate Store WOS (total replen cover) per store — index-aligned to utils.
// Mix of Bloated (>20), Slow (>16), Healthy (2–16) and Rapid (<2) turns.
const CAPACITY_WOS = [24, 22, 9, 1.6, 12, 21, 6, 18, 1.4, 8, 26, 5, 3, 17]

// Store tier / cluster labels, index-aligned.
const CAPACITY_TIERS = [
  'Flagship · North', 'Standard · Metro', 'Outlet · East', 'Express · Hub',
  'Standard · West', 'Flagship · Central', 'Standard · South', 'Outlet · North',
  'Express · Metro', 'Standard · East', 'Flagship · West', 'Outlet · Central',
  'Standard · Hub', 'Outlet · South',
]

function buildCapacityRows() {
  return CAPACITY_UTILS.map((util, i) => {
    const capacity = 4400 - i * 120
    const projected = Math.round(capacity * util)
    // Split projected fill across the four components with realistic weights.
    const onHand = Math.round(projected * 0.26)
    const onOrder = Math.round(projected * 0.14)
    const inTransit = Math.round(projected * 0.11)
    const newAllocation = projected - onHand - onOrder - inTransit
    const overUnits = projected - capacity
    const pct = (util * 100).toFixed(1)
    const storeWos = CAPACITY_WOS[i]
    // Weekly replen sales implied by the target WOS (numerator = total cover).
    const weeklySales = Math.max(Math.round(projected / storeWos), 1)
    const physicalNote =
      overUnits > 0
        ? `Fill exceeds capacity by ${overUnits.toLocaleString()} units (${pct}%) — new allocation is a soft breach.`
        : util >= 0.9
          ? `Fill at ${pct}% of capacity — within the soft-warning band.`
          : `Fill at ${pct}% of capacity — approaching the soft limit.`
    const velocityNote =
      storeWos < 10
        ? ` Store-wide forward cover is thin at ${storeWos} FWOS — needs review before store-wide stockouts.`
        : storeWos <= 20
          ? ` Store-wide forward cover is fine at ${storeWos} FWOS — adequate, monitor.`
          : ` Store-wide forward cover is healthy at ${storeWos} FWOS — ample buffer.`
    return {
      id: `ks${pad(i + 1, 3)}a${pad((i % 5) + 1)}`,
      name: '000-outlet-store',
      tier: CAPACITY_TIERS[i],
      plans: CAPACITY_PLAN_IDS[i],
      capacity,
      onHand,
      onOrder,
      inTransit,
      newAllocation,
      weeklySales,
      storeWos,
      note: `System Note: ${physicalNote}${velocityNote}`,
    }
  })
}

// Per-bucket phrasing for the shared deep-tree generator.
const DEEP_CONFIGS = {
  minConstraints: {
    idPrefix: 'mn',
    codeBase: 2700,
    sign: '+',
    baseUnits: 420,
    unitWord: 'excess units',
    clusterNoun: 'over-allocated style cluster',
    clusterNounPlural: 'over-allocated style clusters',
    styleVerb: 'Over-allocated at',
    note: (u) =>
      `System Note: Minimum floor forced ${u} excess units onto this slow channel, well above its trailing demand.`,
  },
  maxCapping: {
    idPrefix: 'mx',
    codeBase: 2600,
    sign: '-',
    baseUnits: 260,
    unitWord: 'throttled units',
    clusterNoun: 'capped style cluster',
    clusterNounPlural: 'capped style clusters',
    styleVerb: 'Capped at ceiling across',
    note: (u) =>
      `System Note: Configured max cap reached before demand was satisfied — ${u} units throttled at this store.`,
  },
  sizeCurve: {
    idPrefix: 'sz',
    codeBase: 3200,
    sign: '-',
    baseUnits: 180,
    unitWord: 'skewed units',
    clusterNoun: 'skewed size-curve deployment',
    clusterNounPlural: 'skewed size-curve deployments',
    styleVerb: 'Skewed profile across',
    note: (u) =>
      `System Note: Shipped size curve deviates from baseline demand history — ${u} units mis-profiled (XL over, Small under) at this store.`,
  },
  packConfig: {
    idPrefix: 'pk',
    codeBase: 2700,
    sign: '-',
    baseUnits: 340,
    unitWord: 'shortfall units',
    clusterNoun: 'broken style cluster',
    clusterNounPlural: 'broken style clusters',
    styleVerb: 'Impacting',
    note: (u) =>
      `System Note: Localized demand landed between pack multiples; rounding to the nearest full case left ${u} units of shelf demand unmet.`,
  },
}

export const insights = [
  {
    id: 'minConstraints',
    icon: '⬆️',
    tone: 'sky',
    iconName: 'arrowUp',
    title: 'Min Constraints Influencing Allocation',
    planCount: 12,
    macro: '12 Plans | 1,194 SKU-Store-Size Combinations | 1,606 Excess Units Over-Allocated',
    directoryTitle: 'MINIMUM FLOOR ENFORCEMENT DIRECTORY',
    directoryHint: 'Rows where minimum floors pushed allocation above demand',
    type: 'tree',
    plans: buildDeepPlans(DEEP_CONFIGS.minConstraints),
  },
  {
    id: 'maxCapping',
    icon: '🔒',
    tone: 'slate',
    iconName: 'lock',
    title: 'Max Capping Allocation',
    planCount: 12,
    macro: '12 Plans | 312 combinations reached configured ceilings | 190 units throttled',
    directoryTitle: 'CEILING ENFORCEMENT DIRECTORY',
    directoryHint: 'Rows where max caps throttled allocation',
    type: 'tree',
    plans: buildDeepPlans(DEEP_CONFIGS.maxCapping),
  },
  {
    id: 'packConfig',
    icon: '🧩',
    tone: 'indigo',
    iconName: 'puzzle',
    title: 'Pack Config → Under / Over Allocation',
    planCount: 12,
    macro: '12 Plans | 1,271 SKU-Store-Size Combinations | 6,977 Units Under/Over Pack Multiple',
    directoryTitle: 'RELATIONAL IMPACT DIRECTORY',
    directoryHint: 'Click rows to trace allocation nodes',
    type: 'tree',
    plans: buildDeepPlans(DEEP_CONFIGS.packConfig),
  },
  {
    id: 'dcInventory',
    icon: '🔴',
    tone: 'rose',
    iconName: 'alert',
    title: 'DC Inventory & Multi-DC Sourcing',
    subtitle: 'HIGH SEVERITY ANOMALY',
    planCount: 4,
    macro: 'Primary DC over-bound / exhausted → fallback draw from secondary DC | 4 Plans Affected | 16 Product-Store combinations',
    directoryTitle: 'CRITICAL SUPPLY CONSTRAINT DIRECTORY',
    directoryHint: 'Trace constrained components to purchase orders and cross-DC fallback sourcing',
    type: 'poTable',
    // Multi-DC sourcing summary: primary DC drawn past its safe bound, forcing
    // fallback allocation from a secondary DC to keep plans moving. Each DC
    // reports its % consumed (capped at 100) plus the raw draw, so the UI can
    // give a clear network-wide overview of consumption and exhaustion.
    dcFlow: {
      overview: {
        totalDcs: 2,
        exhaustedDcs: 1,
        networkConsumedPct: 79,
        fallbackUnits: 1240,
      },
      primary: {
        role: 'Primary',
        name: 'DC-01 · North',
        consumedPct: 100,
        drawnPct: 112,
        status: 'Exhausted',
      },
      secondary: {
        role: 'Secondary',
        name: 'DC-02 · Central',
        consumedPct: 21,
        drawUnits: 1240,
        status: 'Active Fallback',
      },
    },
    rows: [
      {
        icon: '👕',
        style: 'KS1002733 001',
        group: 'Core Acc',
        status: 'DC Inv Exhausted',
        statusTone: 'critical',
        primaryDc: 'DC-01 · North',
        primaryDcStatus: 'Exhausted',
        sourcedFrom: 'DC-02 · Central',
        fallbackUnits: 820,
        // Some style-colors require MULTIPLE dispatch POs to fully expedite
        // (e.g. a split shipment across vendors / delivery lanes).
        pos: [
          { po: 'PO-2026-X992', eta: 'July 28', channel: 'Vendor Direct' },
          { po: 'PO-2026-X993', eta: 'July 31', channel: 'Central Hub Delivery' },
        ],
      },
      {
        icon: '👗',
        style: 'KS1002698 420',
        group: 'Core Acc',
        status: 'DC Inv Below Threshold',
        statusTone: 'warning',
        primaryDc: 'DC-01 · North',
        primaryDcStatus: 'Over-Bound',
        sourcedFrom: 'DC-02 · Central',
        fallbackUnits: 420,
        po: 'PO-2026-X411',
        eta: 'Aug 02',
        channel: 'Central Hub Delivery',
      },
    ],
  },
  {
    id: 'sizeCurve',
    icon: '🟡',
    tone: 'amber',
    iconName: 'ruler',
    title: 'Size Curve Deviation',
    planCount: 12,
    macro: '12 Plans | Shipped profiles deviate from baseline store demand history',
    directoryTitle: 'RELATIONAL SIZE SKEW PROFILE',
    directoryHint: 'Trace skewed deployments to store level',
    type: 'tree',
    plans: buildDeepPlans(DEEP_CONFIGS.sizeCurve),
  },
  {
    id: 'storeCapacity',
    icon: '📦',
    tone: 'teal',
    iconName: 'warehouse',
    title: 'Store Capacity & Total Store Velocity',
    subtitle: 'MACRO STORE HEALTH',
    planCount: 12,
    macro: '14 Stores Evaluated | 5 Over Physical Capacity (1,842 overflow units) | 7 Need Review (<10 FWOS) | 4 Healthy Cover (>20 FWOS)',
    directoryTitle: 'MACRO STORE HEALTH DIRECTORY',
    directoryHint: 'Two lenses — Capacity Breach (fill vs. capacity) and Store Velocity (FWOS: Healthy >20 · Fine 10–20 · Needs Review <10)',
    type: 'capacityTable',
    rows: buildCapacityRows(),
  },
]

export const validationChecks = [
  {
    check: 'DC ATA Over-Drain',
    status: 'FLAGGED',
    statusTone: 'critical',
    severity: 'CRITICAL',
    severityCount: 4,
    notes: '100.0% of available safety buffer storage was breached.',
  },
  {
    check: 'Priority Inversion',
    status: 'FLAGGED',
    statusTone: 'warning',
    severity: 'MEDIUM',
    severityCount: 2,
    notes: '6 individual allocation plans ran out of priority sequence.',
  },
  {
    check: 'Single Store Concentration',
    status: 'FLAGGED',
    statusTone: 'warning',
    severity: 'MEDIUM',
    severityCount: 2,
    notes: '1 plan concentrated over 75% of stock in a single outlet.',
  },
  {
    check: 'Store Capacity & Velocity Breach',
    status: 'FLAGGED',
    statusTone: 'critical',
    severity: 'CRITICAL',
    severityCount: 12,
    notes: '5 stores over physical capacity (1,842 overflow units); 7 need review with thin forward cover (<10 FWOS).',
  },
  {
    check: 'Size Curve Deviation',
    status: 'CLEAR',
    statusTone: 'clear',
    severity: 'NONE',
    severityCount: 0,
    notes: 'Shipped size curve distributions match baseline targets.',
  },
]

export const worklist = [
  {
    id: 'PLN-092',
    styles: '14 Styles',
    channels: '134 Outlets',
    rate: 51.0,
    unmet: '4,156 Units',
    revenue: '$578.00',
    status: 'Constrained',
    fwos: 0.9,
    fwosStores: 8,
  },
  {
    id: 'PLN-104',
    styles: '6 Styles',
    channels: '4 Flagged Hubs',
    rate: 36.3,
    unmet: '2,057 Units',
    revenue: '$221.00',
    status: 'Urgent',
    fwos: 0.4,
    fwosStores: 4,
  },
  {
    id: 'PLN-101',
    styles: '9 Styles',
    channels: '58 Outlets',
    rate: 62.4,
    unmet: '1,204 Units',
    revenue: '$142.00',
    status: 'Constrained',
    fwos: 1.6,
    fwosStores: 0,
  },
  {
    id: 'PLN-108',
    styles: '4 Styles',
    channels: '22 Outlets',
    rate: 71.2,
    unmet: '640 Units',
    revenue: '$96.00',
    status: 'Constrained',
    fwos: 2.1,
    fwosStores: 0,
  },
  {
    id: 'PLN-110',
    styles: '2 Styles',
    channels: '12 Stores',
    rate: 100.0,
    unmet: '0 Units',
    revenue: '$0.00',
    status: 'Safe',
  },
  {
    id: 'PLN-115',
    styles: '3 Styles',
    channels: '18 Stores',
    rate: 100.0,
    unmet: '0 Units',
    revenue: '$0.00',
    status: 'Safe',
  },
  {
    id: 'PLN-118',
    styles: '5 Styles',
    channels: '41 Outlets',
    rate: 44.8,
    unmet: '1,880 Units',
    revenue: '$204.00',
    status: 'Urgent',
    fwos: 0.7,
    fwosStores: 5,
  },
  {
    id: 'PLN-121',
    styles: '7 Styles',
    channels: '73 Outlets',
    rate: 58.1,
    unmet: '990 Units',
    revenue: '$118.00',
    status: 'Constrained',
  },
  {
    id: 'PLN-124',
    styles: '6 Styles',
    channels: '35 Outlets',
    rate: 39.5,
    unmet: '2,410 Units',
    revenue: '$266.00',
    status: 'Urgent',
    fwos: 0.5,
    fwosStores: 6,
  },
  {
    id: 'PLN-127',
    styles: '8 Styles',
    channels: '64 Outlets',
    rate: 47.2,
    unmet: '1,530 Units',
    revenue: '$173.00',
    status: 'Urgent',
    fwos: 0.8,
    fwosStores: 4,
  },
  {
    id: 'PLN-131',
    styles: '5 Styles',
    channels: '29 Outlets',
    rate: 54.6,
    unmet: '860 Units',
    revenue: '$104.00',
    status: 'Constrained',
    fwos: 1.1,
    fwosStores: 3,
  },
  {
    id: 'PLN-134',
    styles: '4 Styles',
    channels: '21 Outlets',
    rate: 60.9,
    unmet: '705 Units',
    revenue: '$88.00',
    status: 'Constrained',
    fwos: 1.4,
    fwosStores: 2,
  },
  {
    id: 'PLN-137',
    styles: '6 Styles',
    channels: '33 Outlets',
    rate: 49.3,
    unmet: '1,120 Units',
    revenue: '$131.00',
    status: 'Urgent',
    fwos: 0.9,
    fwosStores: 4,
  },
  {
    id: 'PLN-140',
    styles: '3 Styles',
    channels: '17 Outlets',
    rate: 66.2,
    unmet: '540 Units',
    revenue: '$72.00',
    status: 'Constrained',
    fwos: 1.7,
    fwosStores: 1,
  },
]

function parseNum(value) {
  return Number(String(value).replace(/[^0-9.]/g, '')) || 0
}

// Look up plan-level metrics (allocation rate, unmet, revenue, status) by plan ID.
export function getPlanMeta(planId) {
  return worklist.find((p) => p.id === planId) || null
}

// Build exportable CSV rows for a diagnostic insight bucket (by id).
// Shared by the Playbook (export list) and the Diagnostic Insights Studio.
export function buildInsightExport(bucketId) {
  const item = insights.find((b) => b.id === bucketId)
  if (!item) return []
  if (item.type === 'poTable') {
    return ['Style-Color,Group,Network Status,Primary DC,Primary DC Status,Sourced From,Fallback Units,Target POs'].concat(
      item.rows.map((r) => {
        // Support either a single PO (po/eta/channel) or a list (pos[]).
        const pos = r.pos || [{ po: r.po, eta: r.eta, channel: r.channel }]
        const poCol = pos.map((p) => `${p.po} (ETA ${p.eta} / ${p.channel})`).join(' | ')
        return `${r.style},${r.group},${r.status},${r.primaryDc || ''},${r.primaryDcStatus || ''},${r.sourcedFrom || ''},${r.fallbackUnits || ''},"${poCol}"`
      }),
    )
  }
  if (item.type === 'capacityTable') {
    return [
      'Store,Tier / Cluster,Plans,Capacity,On Hand,On Order,In Transit,New Allocation,Total Fill,Utilization %,Overflow Units,Weekly Replen Sales,Store FWOS,Velocity Status',
    ].concat(
      item.rows.map((r) => {
        const projected = r.onHand + r.onOrder + r.inTransit + r.newAllocation
        const util = ((projected / r.capacity) * 100).toFixed(1)
        const overflow = Math.max(projected - r.capacity, 0)
        const velocity =
          r.storeWos > 20
            ? 'Healthy (>20 FWOS)'
            : r.storeWos >= 10
              ? 'Fine (10–20 FWOS)'
              : 'Needs Review (<10 FWOS)'
        return `${r.id} ${r.name},${r.tier},${r.plans},${r.capacity},${r.onHand},${r.onOrder},${r.inTransit},${r.newAllocation},${projected},${util}%,${overflow},${r.weeklySales},${r.storeWos},${velocity}`
      }),
    )
  }
  const header =
    'Plan,Allocation Rate,Unmet Volume,Revenue at Risk,Status,Style-Color,Group,Store,Units,Sizes'
  const lines = []
  item.plans.forEach((plan) => {
    const meta = getPlanMeta(plan.id)
    plan.styles.forEach((style) => {
      style.stores.forEach((store) => {
        lines.push(
          `${plan.id},${meta ? `${meta.rate.toFixed(1)}%` : ''},${meta?.unmet || ''},${meta?.revenue || ''},${meta?.status || ''},${style.code},${style.group},${store.id} ${store.name},${store.units},"${store.sizes}"`,
        )
      })
    })
  })
  return [header, ...lines]
}

// ─────────────────────────────────────────────────────────────────────────
// Unified insight cards — the single source the merged Insights section reads.
// Each card joins its Handbook drill-down (`insights`, keyed by `id`) with its
// Playbook action narrative (`playbook`, keyed by `exportBucketId`). Keeping
// both source arrays intact means nothing else has to change; this selector is
// purely additive. Buckets without a matching playbook entry still render (the
// action fields simply come through undefined).
// ─────────────────────────────────────────────────────────────────────────
export const insightCards = insights.map((insight) => {
  const action = playbook.find((p) => p.exportBucketId === insight.id)
  return {
    ...insight,
    severity: action?.severity || 'warning',
    what: action?.what,
    why: action?.why,
    next: action?.next,
    lostSales: action?.lostSales,
    lostSalesValue: action?.lostSalesValue,
    trigger: action?.trigger,
  }
})

// High-level summary of the worklist, split into risked vs safe plans.
// `excludeIds` lets callers drop already fast-tracked/approved plans.
export function getWorklistSummary(excludeIds = []) {
  const active = worklist.filter((p) => !excludeIds.includes(p.id))
  const risked = active.filter((p) => p.status !== 'Safe')
  const safe = active.filter((p) => p.status === 'Safe')
  const totalUnmet = risked.reduce((sum, p) => sum + parseNum(p.unmet), 0)
  const totalRevenue = risked.reduce((sum, p) => sum + parseNum(p.revenue), 0)
  const urgent = risked.filter((p) => p.status === 'Urgent')
  const constrained = risked.filter((p) => p.status === 'Constrained')
  return {
    risked,
    safe,
    urgent,
    constrained,
    riskedCount: risked.length,
    safeCount: safe.length,
    totalUnmet,
    totalRevenue,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// WHAT-IF AGENT — allocation scenario simulation.
// The agent compares a Base Plan against 1–3 what-if scenarios. Each scenario
// carries: cause/effect settings, an allocation trade-off (excess vs lost
// sales), and a full execution scorecard. Deltas are stored as raw signed
// numbers so the UI can render +/- and green/red consistently.
// ─────────────────────────────────────────────────────────────────────────

// A metric cell: value + optional signed delta + semantic direction.
//   dir: 'good' | 'bad' | 'warn' | 'neutral' → drives the 🟢/🔴/🟡 tone.
const m = (value, delta = null, dir = 'neutral') => ({ value, delta, dir })

export const whatIfAgent = {
  insightTitle: 'Purchase Order Inventory Allocation & Network Optimization',
  reportMeta: 'Fall 2026 Cycle · Inbound PO Allocation Study · Read-only simulation',
  basePlan: { code: 'BP-2026-FALL-V3', name: 'Base Allocation — Fall Cycle' },
  aiOverview:
    'The base plan leaves high-velocity outerwear exposed to stockouts while trapping depth behind loose ceilings on bulky knits. Two scenarios were evaluated against the inbound PO pool: a constraint rebalancing that reshapes min/max floors within the existing 250 doors, and a network expansion that spreads PO density across 45 new doors.',
  recommendedScenarioId: 'sc-1',

  // Baseline column used by the scenario comparison table.
  base: {
    storesAllocated: m('250'),
    stylesAllocated: m('85'),
    totalEaches: m('120,000'),
    totalPacks: m('12,000'),
    excessUsd: m('$180,000'),
    overallocQty: m('6,000'),
    lostSalesUsd: m('$112,000'),
    unmetQty: m('3,740'),
    overCapacity: m('18'),
    exhaustedPo: m('14'),
  },

  scenarios: [
    {
      id: 'sc-1',
      name: 'Scenario 1 · Constraint Rebalancing',
      code: 'SCEN-2026-FALL-OPT1',
      tagline: 'Constraint Rebalancing',
      overview:
        'Scenario 1 adjusts unit thresholds by doubling safety stock for high-velocity outerwear and capping maximum backroom depth on bulky knits within the existing 250 stores. This directly eliminates $63,500 in lost sales while maintaining total network unit commitment.',
      settings: {
        parameters:
          'Increased Min Constraint 12 → 24 units for Outerwear Core (15 Style-Colors); Decreased Max Constraint 120 → 80 units for Heavy Knits (10 Style-Colors).',
        parametersEffect:
          'Directly protects safety-stock floors for high-demand outerwear while preventing backroom inventory gridlock for heavy knits.',
        productScope: 'Unchanged (0 Styles Added / Removed)',
        productScopeEffect:
          'Maintains baseline demand curves and ensures stable, predictable inbound PO stock depletion.',
        networkBreadth: 'Unchanged (Store Count: 250 Doors)',
        networkBreadthEffect:
          'Prevents inventory dilution, keeping Forward Weeks of Supply stable at 4.2 weeks.',
      },
      tradeOff: {
        overAllocUsd: '$142,000', overAllocUsdDelta: -38000, overAllocUsdPct: '-21.1%', overAllocUsdDir: 'good',
        overAllocQty: '4,730', overAllocQtyDelta: -1270, overAllocQtyPct: '-21.1%', overAllocQtyDir: 'good',
        lostSalesUsd: '$48,500', lostSalesUsdDelta: -63500, lostSalesUsdPct: '-56.7%', lostSalesUsdDir: 'good',
        unmetQty: '1,620', unmetQtyDelta: -2120, unmetQtyPct: '-56.7%', unmetQtyDir: 'good',
      },
      comparison: {
        storesAllocated: m('250', 0, 'neutral'),
        stylesAllocated: m('85', 0, 'neutral'),
        totalEaches: m('120,000', 0, 'neutral'),
        totalPacks: m('12,000', 0, 'neutral'),
        excessUsd: m('$142,000', -38000, 'good'),
        overallocQty: m('4,730', -1270, 'good'),
        lostSalesUsd: m('$48,500', -63500, 'good'),
        unmetQty: m('1,620', -2120, 'good'),
        overCapacity: m('4', -14, 'good'),
        exhaustedPo: m('3', -11, 'good'),
      },
    },
    {
      id: 'sc-2',
      name: 'Scenario 2 · Door Network Expansion',
      code: 'SCEN-2026-FALL-OPT2',
      tagline: 'Door Network Expansion',
      overview:
        'Scenario 2 maintains baseline store constraints while expanding allocation breadth across a new store cluster. This accelerates inbound PO consumption by distributing 15,000 additional units across 45 expansion doors.',
      settings: {
        parameters:
          'Kept parameters at Base Plan settings (Min Constraint = 12 units, Max Constraint = 120 units across all Style-Colors).',
        parametersEffect:
          'Maintains baseline safety-stock floors, leaving high-traffic stores exposed to stockouts during demand spikes.',
        productScope: 'Unchanged (0 Styles Added / Removed)',
        productScopeEffect:
          'Spreads existing style assortment across expanded doors without modifying style mix.',
        networkBreadth:
          'Added New Store Group "Tier-2 Regional Expansion" (+45 Stores) — Store Count 250 → 295.',
        networkBreadthEffect:
          'Spreads PO unit density across a broader door network, accelerating PO inventory consumption and lowering average FWOS to 3.5 weeks.',
      },
      tradeOff: {
        overAllocUsd: '$155,000', overAllocUsdDelta: -25000, overAllocUsdPct: '-13.8%', overAllocUsdDir: 'good',
        overAllocQty: '5,160', overAllocQtyDelta: -840, overAllocQtyPct: '-14.0%', overAllocQtyDir: 'good',
        lostSalesUsd: '$65,000', lostSalesUsdDelta: -47000, lostSalesUsdPct: '-42.0%', lostSalesUsdDir: 'good',
        unmetQty: '2,160', unmetQtyDelta: -1580, unmetQtyPct: '-42.2%', unmetQtyDir: 'good',
      },
      comparison: {
        storesAllocated: m('295', 45, 'good'),
        stylesAllocated: m('85', 0, 'neutral'),
        totalEaches: m('135,000', 15000, 'good'),
        totalPacks: m('13,500', 1500, 'good'),
        excessUsd: m('$155,000', -25000, 'good'),
        overallocQty: m('5,160', -840, 'good'),
        lostSalesUsd: m('$65,000', -47000, 'good'),
        unmetQty: m('2,160', -1580, 'good'),
        overCapacity: m('12', -6, 'good'),
        exhaustedPo: m('8', -6, 'good'),
      },
    },
  ],

  // Percent deltas for the comparison table, keyed [scenarioId][metricKey].
  comparisonPct: {
    'sc-1': {
      storesAllocated: '0%', stylesAllocated: '0%', totalEaches: '0%', totalPacks: '0%',
      excessUsd: '-21.1%', overallocQty: '-21.1%', lostSalesUsd: '-56.7%', unmetQty: '-56.7%',
      overCapacity: '-77.8%', exhaustedPo: '-78.6%',
    },
    'sc-2': {
      storesAllocated: '+18.0%', stylesAllocated: '0%', totalEaches: '+12.5%', totalPacks: '+12.5%',
      excessUsd: '-13.8%', overallocQty: '-14.0%', lostSalesUsd: '-42.0%', unmetQty: '-42.2%',
      overCapacity: '-33.3%', exhaustedPo: '-42.9%',
    },
  },

  // Derived executive summary tiles (computed from the recommended scenario S1).
  summaryTiles: [
    { id: 'recovered', label: 'Lost Sales Recovered', value: '$63,500', sub: 'vs base · −56.7%', dir: 'good' },
    { id: 'excess', label: 'Excess Risk Trimmed', value: '$38,000', sub: 'vs base · −21.1%', dir: 'good' },
    { id: 'capacity', label: 'Over-Capacity Doors', value: '18 → 4', sub: '−14 doors · −77.8%', dir: 'good' },
  ],

  // Derived AI verdict tiles (confidence / upside / risk) from the content.
  verdict: [
    { id: 'confidence', kind: 'confidence', title: 'Confidence', score: '92%', body: 'High — rebalancing maps to proven demand curves within the existing 250 doors; no assortment or breadth risk introduced.' },
    { id: 'upside', kind: 'upside', title: 'Net Financial Upside', headline: '+$101.5K', body: '$63.5K lost-sales recovered plus $38.0K excess risk avoided under Constraint Rebalancing (Scenario 1).' },
    { id: 'risk', kind: 'risk', title: 'Primary Risk', headline: 'Expansion dilution (S2)', body: 'The fallback expansion (S2) lowers FWOS to 3.5 weeks and still leaves 8 PO styles exposed — prefer S1 unless regional volume is required.' },
  ],

  // Agent Action Playbook — the concrete, PO-tagged way-forward steps.
  actions: [
    {
      id: 'a1',
      title: 'Apply Min Constraint Override on Inbound PO #99401',
      po: 'PO #99401',
      impact: '+$63,500 protected',
      impactDir: 'good',
      body: 'Update Min Constraint from 12 to 24 units for the Outerwear Style-Color List (15 Styles) directly on arriving freight to protect $63,500 in lost sales.',
    },
    {
      id: 'a2',
      title: 'Enforce Max Capacity Ceiling on Inbound PO #99402',
      po: 'PO #99402',
      impact: '−$38,000 excess',
      impactDir: 'good',
      body: 'Reduce Max Constraint from 120 to 80 units for the Heavy Knit Style-Color List (10 Styles) across backroom-constrained stores to lower excess holding risk by $38,000.',
    },
    {
      id: 'a3',
      title: 'Release Open PO Balance to Expansion Store Group',
      po: 'PO #99405',
      impact: '15,000 eaches',
      impactDir: 'neutral',
      body: 'Allocate 15,000 unallocated eaches from arriving PO #99405 to Store Group "Tier-2 Regional Expansion" (+45 doors) to capture incremental regional volume.',
    },
    {
      id: 'a4',
      title: 'Enable PO Stockout Monitoring Alerts',
      po: 'Outerwear POs',
      impact: 'Threshold < 10%',
      impactDir: 'warn',
      body: 'Set automated threshold alerts for PO lines assigned to Outerwear Style-Colors when unallocated PO balances drop below 10% of total store demand.',
    },
    {
      id: 'a5',
      title: 'Execute Cross-Dock Priority Bypass',
      po: 'PO #99401',
      impact: '−$12,400 handling',
      impactDir: 'good',
      body: 'Route 35% of incoming PO #99401 inventory straight to the top 50 flagship stores, accelerating floor setup by 3 days and reducing handling costs by $12,400.',
    },
  ],
}

