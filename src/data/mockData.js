// Central mock dataset for the AutoAllocation Workspace.
// Mirrors the numbers described in the product blueprint.

export const triage = {
  allCycles: {
    count: 10,
    label: 'Active Plans',
    subtext: 'Covers 20 Products | 141 Stores',
  },
  safe: {
    historical: 0,
    simulated: 2,
    subtext: '0 shortfalls or alerts',
  },
  issues: {
    count: 8,
    subtext: 'Constrained or Over-Allocated',
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
    value: '5,894',
    accent: 'slate',
    lines: [
      { label: 'Rate', value: '53.8%' },
      { label: 'Demand Pool', value: '10,957' },
    ],
    spark: [42, 48, 45, 52, 50, 58, 54],
    delta: '+6.2%',
    deltaDir: 'up',
    tooltip: 'Total units committed across all active allocation runs in this cycle.',
  },
  {
    id: 'ata',
    icon: 'Factory',
    title: 'DC Consumption & Sourcing',
    value: '9.3%',
    accent: 'amber',
    warning:
      'System Flag: Primary DC (DC-01 · North) is over-bound at 112%; allocation is falling back to DC-02 · Central to keep plans moving.',
    lines: [
      { label: '', value: '5,894 / 63,108 units drawn · 57,214 left' },
      { label: 'Primary', value: 'DC-01 · North over-bound 112%', warn: true },
      { label: 'Fallback', value: '1,240u (21%) from DC-02 · Central' },
    ],
    spark: [4, 5, 6, 6, 7, 8, 9.3],
    delta: '+2.1pt',
    deltaDir: 'up',
    tooltip:
      'Share of distribution-center Available-To-Allocate inventory consumed this cycle, plus the cross-DC fallback: when the primary DC is over-bound or exhausted, allocation draws from a secondary DC (added lead time and handling cost).',
  },
  {
    id: 'oos',
    icon: 'AlertTriangle',
    title: 'Demand Unmet Rate',
    value: '47.6%',
    trend: 'up',
    accent: 'rose',
    lines: [
      { label: 'Demand Met', value: '52.4%' },
      { label: 'FWOS < 1', value: '23 of 141 stores under 1-wk cover', warn: true },
      { label: '', value: '3-run consecutive increase', warn: true },
    ],
    spark: [31, 34, 38, 40, 42, 45, 47.6],
    delta: '+3 runs',
    deltaDir: 'up',
    overlay: { unmetUnits: '6,979', label: 'Unmet Units' },
    tooltip:
      'Share of demand that would go unmet if plans dispatch as currently constrained. FWOS < 1 flags stores with less than one forward week of supply — the leading edge of unmet demand.',
  },
  {
    id: 'revenue',
    icon: 'DollarSign',
    title: 'Revenue at Risk',
    value: '$221.00',
    accent: 'violet',
    lines: [
      { label: '', value: '2.00 Est. Lost Units if Delayed' },
      { label: '', value: '4 high-exposure stores' },
    ],
    spark: [120, 145, 160, 180, 195, 210, 221],
    delta: '4 stores',
    deltaDir: 'up',
    tooltip: 'Estimated revenue exposure from unmet demand across flagged stores.',
  },
  {
    id: 'storesNearCapacity',
    icon: 'Warehouse',
    title: 'Stores Near Capacity',
    value: '9',
    accent: 'indigo',
    lines: [
      { label: 'Of', value: '141 stores in cycle' },
      { label: 'Breach', value: '2 stores project over 100% fill', warn: true },
    ],
    spark: [2, 3, 4, 5, 6, 8, 9],
    delta: '+3 stores',
    deltaDir: 'up',
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
    severity: 'warning',
    title: 'Store Capacity Soft Constraint',
    what:
      'For 9 of 141 stores, projected fill (On Hand + On Order + In Transit + New Allocation) is nearing or exceeding physical store capacity across 3 plans — a soft-constraint breach that allocation did not hard-stop.',
    why:
      'Store capacity is a soft limit, so the runner can allocate past it. Overfilled stores cannot shelf the inventory, leading to backroom congestion, delayed processing, and stock effectively stranded off the floor.',
    next:
      'Review the near-capacity stores: trim or stagger the new allocation, or set up a store-to-store transfer to relieve the overfill before dispatch.',
    lostSales:
      'Overfilled stores strand incoming units in the backroom instead of on the floor, delaying sell-through at the very stores already at their limit.',
    lostSalesValue: 'Fill / handling risk',
    trigger: 'Export the Near-Capacity Stores List',
    exportBucketId: 'storeCapacity',
  },
]

export const insights = [
  {
    id: 'minConstraints',
    icon: '⬆️',
    tone: 'sky',
    iconName: 'arrowUp',
    title: 'Min Constraints Influencing Allocation',
    planCount: 3,
    macro: '3 Plans | 1,194 SKU-Store-Size Combinations | 1,606 Excess Units Over-Allocated',
    directoryTitle: 'MINIMUM FLOOR ENFORCEMENT DIRECTORY',
    directoryHint: 'Rows where minimum floors pushed allocation above demand',
    type: 'tree',
    plans: [
      {
        id: 'PLN-118',
        summary: 'Contains 2 over-allocated style clusters | +980 excess units',
        styles: [
          {
            code: 'KS1002740 110',
            group: 'Core Acc',
            summary: 'Over-allocated at 3 slow channels (+640 units)',
            stores: [
              {
                id: 'ks012a01',
                name: '000-outlet-store',
                units: '+420 units',
                sizes: 'S, M',
                note:
                  'System Note: Minimum floor is set to 6 units, but trailing demand averages 0.4 units/week. The floor forced 420 excess units onto the shelf.',
              },
              {
                id: 'ks014a02',
                name: '000-outlet-store',
                units: '+220 units',
                sizes: 'M, L',
                note:
                  'System Note: Binding minimum floor over-allocated this slow channel beyond localized demand.',
              },
            ],
          },
          {
            code: 'KS1002755 001',
            group: 'Fashion Acc',
            summary: 'Over-allocated at 2 outlets (+340 units)',
            stores: [
              {
                id: 'ks016a03',
                name: '000-outlet-store',
                units: '+340 units',
                sizes: 'S, M, L',
                note:
                  'System Note: Minimum floor >1 held while trailing sales dropped below 1 unit/week, trapping stock at a low-velocity outlet.',
              },
            ],
          },
        ],
      },
      {
        id: 'PLN-124',
        summary: 'Contains 1 over-allocated style cluster | +626 excess units',
        styles: [
          {
            code: 'KS1002733 001',
            group: 'Core Acc',
            summary: 'Over-allocated at 4 slow channels (+626 units)',
            stores: [
              {
                id: 'ks018a05',
                name: '000-outlet-store',
                units: '+626 units',
                sizes: 'M, L, XL',
                note:
                  'System Note: Minimum floor rule forced 626 excess units across 4 low-velocity outlets versus baseline demand.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'maxCapping',
    icon: '🔒',
    tone: 'slate',
    iconName: 'lock',
    title: 'Max Capping Allocation',
    planCount: 2,
    macro: '2 Plans | 312 combinations reached configured ceilings | 190 units throttled',
    directoryTitle: 'CEILING ENFORCEMENT DIRECTORY',
    directoryHint: 'Rows where max caps throttled allocation',
    type: 'tree',
    plans: [
      {
        id: 'PLN-101',
        summary: 'Contains 2 capped style clusters | 190 throttled units',
        styles: [
          {
            code: 'KS1002698 420',
            group: 'Core Acc',
            summary: 'Capped at store ceiling (-190 units)',
            stores: [
              {
                id: 'ks002a05',
                name: '000-outlet-store',
                units: '-190 units',
                sizes: 'L, XL',
                note: 'System Note: Configured max cap reached before demand was satisfied.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'packConfig',
    icon: '🧩',
    tone: 'indigo',
    iconName: 'puzzle',
    title: 'Pack Config → Under / Over Allocation',
    planCount: 7,
    macro: '7 Plans | 1,271 SKU-Store-Size Combinations | 6,977 Units Under/Over Pack Multiple',
    directoryTitle: 'RELATIONAL IMPACT DIRECTORY',
    directoryHint: 'Click rows to trace allocation nodes',
    type: 'tree',
    plans: [
      {
        id: 'PLN-092',
        summary: 'Contains 3 broken style clusters | 4,156 shortfall units',
        styles: [
          {
            code: 'KS1002738 420',
            group: 'Fashion Acc',
            summary: 'Impacting 2 Outlets (-2,954 units)',
            stores: [
              {
                id: 'ks001a04',
                name: '000-outlet-store',
                units: '-1,800 units',
                sizes: 'S, M, L',
                note:
                  'System Note: Localized demand was 14 units, but the case-pack size is 12. The system rounded down to avoid over-shipping a full second box, leaving 2 units of demand unsatisfied at the shelf.',
              },
              {
                id: 'ks007a03',
                name: '000-outlet-store',
                units: '-1,154 units',
                sizes: 'M, L, XL',
                note:
                  'System Note: Regional demand landed between pack multiples; rounding to the nearest full case left residual shelf demand unmet.',
              },
            ],
          },
          {
            code: 'KS1003245 001',
            group: 'Fashion Acc',
            summary: 'Impacting 1 Store (-1,202 units)',
            stores: [
              {
                id: 'ks004a01',
                name: '000-outlet-store',
                units: '-1,202 units',
                sizes: 'S, M',
                note:
                  'System Note: Demand fell short of a full case-pack multiple; hard-floor rounding suppressed the partial pack.',
              },
            ],
          },
        ],
      },
      {
        id: 'PLN-104',
        summary: 'Contains 1 broken style | 450 shortfall units',
        styles: [
          {
            code: 'KS1002733 001',
            group: 'Core Acc',
            summary: 'Impacting 4 Stores (-450 units)',
            stores: [
              {
                id: 'ks010a02',
                name: '000-outlet-store',
                units: '-450 units',
                sizes: 'M, L',
                note:
                  'System Note: Aggregate store demand rounded below the next full pack multiple across 4 hubs.',
              },
            ],
          },
        ],
      },
    ],
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
    // fallback allocation from a secondary DC to keep plans moving.
    dcFlow: {
      primary: { name: 'DC-01 · North', drawnPct: 112, status: 'Over-Bound' },
      secondary: { name: 'DC-02 · Central', drawUnits: 1240, drawPct: 21 },
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
        po: 'PO-2026-X992',
        eta: 'July 28',
        channel: 'Vendor Direct',
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
    planCount: 1,
    macro: 'Shipped profiles deviate from baseline store demand history | 1 Plan Affected',
    directoryTitle: 'RELATIONAL SIZE SKEW PROFILE',
    directoryHint: 'Trace skewed deployments to store level',
    type: 'tree',
    plans: [
      {
        id: 'PLN-108',
        summary: 'Contains 1 skewed style curve deployment',
        styles: [
          {
            code: 'KS1003245 001',
            group: 'Fashion Acc',
            summary: 'Impacting 1 Store',
            stores: [
              {
                id: 'ks001a04',
                name: '000-outlet-store',
                units: 'Over-allocated XL',
                sizes: 'Under-allocated Small',
                note:
                  'System Note: Shipped size curve over-allocated XL and under-allocated Small at this store versus baseline demand history.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'storeCapacity',
    icon: '📦',
    tone: 'teal',
    iconName: 'warehouse',
    title: 'Store Capacity Soft Constraint',
    subtitle: 'SOFT LIMIT NEARING',
    planCount: 3,
    macro: 'On Hand + On Order + In Transit + New Allocation approaching store capacity | 9 of 141 Stores Near Limit',
    directoryTitle: 'STORE CAPACITY UTILIZATION DIRECTORY',
    directoryHint: 'Projected fill = On Hand + On Order + In Transit + New Allocation vs. store capacity ceiling',
    type: 'capacityTable',
    rows: [
      {
        id: 'ks001a04',
        name: '000-outlet-store',
        plans: 'PLN-092',
        capacity: 4200,
        onHand: 1180,
        onOrder: 640,
        inTransit: 520,
        newAllocation: 2140,
        note:
          'System Note: Projected fill exceeds capacity by 480 units. New allocation is a soft breach — trim or stagger delivery.',
      },
      {
        id: 'ks007a03',
        name: '000-outlet-store',
        plans: 'PLN-092',
        capacity: 3600,
        onHand: 980,
        onOrder: 410,
        inTransit: 360,
        newAllocation: 1690,
        note:
          'System Note: Projected fill at 95.6% of capacity — within the soft-warning band. Monitor before dispatch.',
      },
      {
        id: 'ks010a02',
        name: '000-outlet-store',
        plans: 'PLN-104',
        capacity: 2800,
        onHand: 720,
        onOrder: 300,
        inTransit: 240,
        newAllocation: 1420,
        note:
          'System Note: Projected fill exceeds capacity by 80 units. Consider a store-to-store transfer or delivery stagger.',
      },
      {
        id: 'ks016a03',
        name: '000-outlet-store',
        plans: 'PLN-124',
        capacity: 3000,
        onHand: 610,
        onOrder: 280,
        inTransit: 190,
        newAllocation: 1560,
        note:
          'System Note: Projected fill at 88.0% of capacity — approaching the soft limit. Headroom is thin.',
      },
    ],
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
    check: 'Store Capacity Soft Breach',
    status: 'FLAGGED',
    statusTone: 'warning',
    severity: 'MEDIUM',
    severityCount: 3,
    notes: '9 stores project On Hand + On Order + In Transit + New Allocation near or over capacity.',
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
    return ['Style-Color,Group,Network Status,Primary DC,Primary DC Status,Sourced From,Fallback Units,Target PO'].concat(
      item.rows.map(
        (r) =>
          `${r.style},${r.group},${r.status},${r.primaryDc || ''},${r.primaryDcStatus || ''},${r.sourcedFrom || ''},${r.fallbackUnits || ''},${r.po} (ETA ${r.eta} / ${r.channel})`,
      ),
    )
  }
  if (item.type === 'capacityTable') {
    return [
      'Store,Plans,Capacity,On Hand,On Order,In Transit,New Allocation,Projected Total,Utilization %',
    ].concat(
      item.rows.map((r) => {
        const projected = r.onHand + r.onOrder + r.inTransit + r.newAllocation
        const util = ((projected / r.capacity) * 100).toFixed(1)
        return `${r.id} ${r.name},${r.plans},${r.capacity},${r.onHand},${r.onOrder},${r.inTransit},${r.newAllocation},${projected},${util}%`
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
