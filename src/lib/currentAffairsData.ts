import { VerifiedCurrentAffairItem } from "./currentAffairsTypes";

/**
 * Curated, verified Indian banking, economic, and current affairs knowledge base.
 * Sourced directly from RBI, Ministry of Finance (PIB), NPCI, and NITI Aayog.
 * Spanning the 3 core pillars requested:
 *
 * Pillar 1: RBI and Banking Awareness
 * (Monetary policy, repo rate, inflation targeting, banking regulations, NPAs, digital payments)
 *
 * Pillar 2: Government Schemes and Economy
 * (Financial inclusion, economic indicators, budget, major government initiatives)
 *
 * Pillar 3: National and International Current Affairs
 * (Latest 3-6 months developments + older anchor events that remain critical for SBI PO)
 */
export const VERIFIED_CURRENT_AFFAIRS: VerifiedCurrentAffairItem[] = [
  // ── Pillar 1: RBI & Banking Awareness ──────────────────────────────────────
  {
    id: "ca-p1-mpc-rates",
    title: "RBI Monetary Policy Committee (MPC) Stance & Inflation Targeting (4% +/- 2%)",
    summary:
      "The RBI Monetary Policy Committee continuously assesses domestic food inflation, geopolitical oil supply risks, and core inflation trajectories to calibrate the policy repo rate, balancing retail price stability with sustained economic growth.",
    publishedAt: "2026-08-08",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "RBI & Banking Awareness",
    keyFacts: [
      "Flexible Inflation Targeting (FIT) statutory framework mandated under the RBI Act (target 4% with a tolerance band of +/- 2%)",
      "Monetary policy transmission impacts bank lending benchmarks (EBLR/MCLR) and retail deposit pricing",
      "RBI liquidity management uses variable rate repo (VRR) and reverse repo (VRRR) auctions to align interbank call money rates",
    ],
  },
  {
    id: "ca-p1-npa-recovery",
    title: "RBI Framework on Resolution of Stressed Assets and Gross NPA Trajectory",
    summary:
      "Indian commercial banks recorded historic lows in Gross NPAs (<3%) through aggressive provisioning, IBC (Insolvency and Bankruptcy Code) proceedings, National Asset Reconstruction Company (NARCL), and proactive pre-delinquency monitoring.",
    publishedAt: "2026-06-25",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "RBI & Banking Awareness",
    keyFacts: [
      "Gross Non-Performing Assets (GNPA) ratio across Scheduled Commercial Banks moderated below 3% with high Provision Coverage Ratio (PCR > 75%)",
      "Early warning signals tracked via Special Mention Accounts (SMA-0, SMA-1, SMA-2) to prevent slippages into NPAs",
      "Twin balance sheet revival: Corporate balance sheets deleveraged alongside strengthened bank capital adequacy (CRAR > 16%)",
    ],
  },
  {
    id: "ca-p1-uli-digital",
    title: "Unified Lending Interface (ULI) Nationwide Rollout for Frictionless Credit",
    summary:
      "The Reserve Bank of India nationwide rollout of the Unified Lending Interface (ULI) enables seamless digital flow of verified financial and non-financial data—connecting banks directly with digitized state land registries, satellite crop data, dairy metrics, and GST returns—to slash rural and MSME appraisal times.",
    publishedAt: "2026-08-10",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "RBI & Banking Awareness",
    keyFacts: [
      "Open API architecture built on principles similar to UPI for frictionless credit delivery",
      "Connects banks directly with state land registries, satellite imagery, and milk cooperatives",
      "Eliminates physical documentation bottlenecks for agricultural (KCC) and micro-enterprise loans",
    ],
  },
  {
    id: "ca-p1-cd-ratio",
    title: "RBI Prudential Oversight on Credit-Deposit (CD) Ratios & Deposit Mobilization",
    summary:
      "To counter structural liquidity imbalances caused by credit expansion outstripping retail deposit growth, the Reserve Bank instituted enhanced liquidity coverage and closer scrutiny of elevated credit-deposit ratios (exceeding 80%) across public and private sector banks.",
    publishedAt: "2026-06-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "RBI & Banking Awareness",
    keyFacts: [
      "Persistent gap between credit growth (~14-16%) and deposit growth (~10-12%) creates reliance on short-term bulk borrowings",
      "RBI emphasizes mobilizing sustainable granular retail deposits over volatile high-cost institutional bulk deposits",
      "Strengthens compliance on Liquidity Coverage Ratio (LCR) and Net Stable Funding Ratio (NSFR)",
    ],
  },
  {
    id: "ca-p1-cbdc-eRupee",
    title: "Central Bank Digital Currency (CBDC / Digital Rupee - e₹) Offline & Programmable Expansion",
    summary:
      "RBI expanded retail Digital Rupee (e₹-R) pilots to introduce offline peer-to-peer transaction capabilities in remote internet-dark areas and purpose-bound programmable smart tokens for targeted agricultural inputs and direct government welfare transfers.",
    publishedAt: "2026-07-22",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "RBI & Banking Awareness",
    keyFacts: [
      "Enables offline e₹ transactions in remote locations using NFC and sound-based payment protocols",
      "Programmable tokens ensure government subsidies and corporate disbursements can only be redeemed at authorized merchant categories",
      "Reduces physical cash printing, currency logistics, and counterfeit risks across commercial banks",
    ],
  },

  // ── Pillar 2: Government Schemes & Economy ─────────────────────────────────
  {
    id: "ca-p2-pmjdy-inclusion",
    title: "Financial Inclusion Deepening via Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    summary:
      "PMJDY crossed 54 crore bank accounts with aggregate operational deposits exceeding ₹2.4 lakh crore. The Ministry of Finance prioritized financial deepening: micro-credit access, insurance coverage (PMJJBY/PMSBY), and Atal Pension Yojana (APY) enrollments for rural households.",
    publishedAt: "2026-08-25",
    sourceName: "PIB",
    sourceUrl: "https://pib.gov.in",
    pillar: "Government Schemes & Economy",
    keyFacts: [
      "Over 54 crore accounts opened; over 67% in rural and semi-urban branches; over 55% held by women",
      "Direct Benefit Transfer (DBT) leakage prevention via Aadhaar Payment Bridge (APB)",
      "Focus shifted from mere zero-balance account opening to micro-credit, overdraft facilities, and micro-insurance saturation",
    ],
  },
  {
    id: "ca-p2-union-budget-infra",
    title: "Union Budget & Fiscal Policy: Capital Expenditure & Infrastructure Modernization",
    summary:
      "The Union Budget prioritized high capital expenditure (Capex) investments across railways, logistics (PM Gati Shakti), green energy corridors, and semiconductor manufacturing, while adhering to the fiscal deficit consolidation glide path.",
    publishedAt: "2026-07-15",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in",
    pillar: "Government Schemes & Economy",
    keyFacts: [
      "High central government Capex allocation (>₹11 lakh crore) crowds in private investment in logistics, power, and manufacturing",
      "Fiscal deficit glide path targeting consolidation toward 4.5% of GDP",
      "Special 50-year interest-free loans extended to state governments for capital investment and urban reforms",
    ],
  },
  {
    id: "ca-p2-pm-mudra-credit",
    title: "PM MUDRA Yojana Credit Enhancement & Tarun Category Expansion",
    summary:
      "The government enhanced lending limits under the Pradhan Mantri MUDRA Yojana (PMMY) to ₹20 lakh for entrepreneurs who have successfully repaid previous Tarun loans, bolstering collateral-free credit for growing micro-enterprises and women-led startups.",
    publishedAt: "2026-06-30",
    sourceName: "PIB",
    sourceUrl: "https://pib.gov.in",
    pillar: "Government Schemes & Economy",
    keyFacts: [
      "Three legacy tiers: Shishu (up to ₹50,000), Kishore (₹50,001 to ₹5 lakh), and Tarun (₹5 lakh to ₹10 lakh)",
      "Enhanced Tarun Plus tier up to ₹20 lakh for established entrepreneurs with clean repayment track records",
      "Credit Guarantee Fund for Micro Units (CGFMU) provides guarantee coverage against collateral-free lending",
    ],
  },
  {
    id: "ca-p2-gdp-macro-indicators",
    title: "India Macroeconomic Indicators: GDP Growth, Forex Reserves, and GST Collections",
    summary:
      "India consolidated its position as the fastest-growing major global economy (GDP growth ~6.5–7%), underpinned by record monthly GST collections (exceeding ₹1.8 lakh crore), robust services exports, and foreign exchange reserves topping $670 billion.",
    publishedAt: "2026-09-12",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in",
    pillar: "Government Schemes & Economy",
    keyFacts: [
      "Consistent GST buoyancy indicates domestic formalization and supply-chain transparency",
      "Foreign exchange reserves above $670 billion provide substantial import cover (10+ months) and currency stability",
      "Retail inflation largely aligned within RBI's target band, supported by proactive supply-side food grain management",
    ],
  },

  // ── Pillar 3: National & International Current Affairs ─────────────────────
  {
    id: "ca-p3-upi-crossborder",
    title: "NPCI International Expansion: Cross-Border UPI Real-Time Linkages with Global Fast Payments",
    summary:
      "NPCI International Payments Limited (NIPL) operationalized bilateral linkages connecting India's UPI with real-time payment networks in Singapore (PayNow), the UAE (AANI), France, and ASEAN nations, enabling frictionless instant remittances and Rupee-denominated QR merchant acceptance.",
    publishedAt: "2026-09-04",
    sourceName: "NPCI",
    sourceUrl: "https://www.npci.org.in",
    pillar: "National & International Current Affairs",
    keyFacts: [
      "Bypasses expensive multi-tier correspondent banking networks to slash retail remittance fees",
      "Enables Indian tourists, students, and expatriates to make real-time QR payments abroad from their domestic INR bank accounts",
      "Supports broader bilateral trade settlement in local currencies (INR-AED, INR-SGD), reducing USD dependency",
    ],
  },
  {
    id: "ca-p3-green-finance",
    title: "Sovereign Green Bonds & Mandatory Climate Risk Framework for Public Sector Banks",
    summary:
      "RBI and the Ministry of Finance scaled sovereign green bond issuances and mandated standardized ESG disclosure taxonomies for commercial banks, accelerating lending toward renewable energy, green hydrogen, and climate-resilient agriculture while preventing greenwashing.",
    publishedAt: "2026-05-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "National & International Current Affairs",
    keyFacts: [
      "Funds raised via sovereign and corporate green bonds ring-fenced exclusively for verified sustainable taxonomies",
      "Mandatory board-level climate governance and third-party annual verification to prevent greenwashing",
      "Incentivizes PSBs to finance renewable energy projects without creating asset-liability mismatches",
    ],
  },
  {
    id: "ca-p3-geopolitical-supplychains",
    title: "Global Supply Chain Realignments, India-Middle East-Europe Economic Corridor (IMEC), and Rupee Trade",
    summary:
      "Amid shifting global trade corridors and geopolitical sanctions, India advanced bilateral local currency settlement mechanisms (Vostro accounts) with trading partners and championed strategic connectivity initiatives like IMEC to lower transit time and energy import vulnerabilities.",
    publishedAt: "2026-08-30",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in",
    pillar: "National & International Current Affairs",
    keyFacts: [
      "Special Rupee Vostro Accounts (SRVA) opened by foreign banks to settle bilateral trade directly in INR",
      "Reduces transaction exchange risk and dollar demand in oil, machinery, and fertilizer imports",
      "IMEC corridor integrates rail, ship, and digital undersea cables to streamline trade between India, Gulf nations, and Europe",
    ],
  },
  {
    id: "ca-p3-ai-cyber-resilience",
    title: "RBI Guidelines on Digital Fraud Containment, AI Governance, and Payment Aggregator Oversight",
    summary:
      "With rapid digital banking adoption, RBI introduced mandatory real-time AI fraud detection protocols to identify mule account syndicates, enforced cooling-off periods for high-value fund transfers, and tightened cybersecurity audits across fintech payment gateways.",
    publishedAt: "2026-09-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in",
    pillar: "National & International Current Affairs",
    keyFacts: [
      "Mandates automated mule account identification algorithms across mobile and internet banking gateways",
      "Introduces staged cooling-off delays for newly registered beneficiaries in high-value transfers",
      "Enforces stricter liability on payment aggregators and partner banks for delayed fraud reporting",
    ],
  },
];
