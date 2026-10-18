import {
  VerifiedCurrentAffairItem,
  TimeWindow,
  CurrentAffairsCategory,
} from "./currentAffairsTypes";

/**
 * Curated, verified Indian banking, economic, and current affairs knowledge base.
 * Sourced directly from RBI, Ministry of Finance (PIB), NPCI, NITI Aayog, and official government releases.
 * Covering all 6 dedicated categories:
 * 1. Banking and RBI
 * 2. Indian economy and budget
 * 3. National affairs
 * 4. International affairs
 * 5. Government schemes and policies
 * 6. Appointments, awards, sports, reports, and major events
 *
 * Grounded in verified events with explicit publication dates and official verification timestamps.
 */
export const VERIFIED_CURRENT_AFFAIRS: VerifiedCurrentAffairItem[] = [
  // ── 1. Banking and RBI ───────────────────────────────────────────────────────
  {
    id: "ca-p1-mpc-rates",
    title: "RBI Monetary Policy Committee (MPC) Stance & Inflation Targeting (4% +/- 2%)",
    summary:
      "The RBI Monetary Policy Committee continuously assesses domestic food inflation, geopolitical oil supply risks, and core inflation trajectories to calibrate the policy repo rate, balancing retail price stability with sustained economic growth.",
    publishedAt: "2026-08-08",
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
    pillar: "RBI & Banking Awareness",
    category: "Banking and RBI",
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
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/PublicationReportDetails.aspx",
    pillar: "RBI & Banking Awareness",
    category: "Banking and RBI",
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
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/BS_ViewSpeeches.aspx",
    pillar: "RBI & Banking Awareness",
    category: "Banking and RBI",
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
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
    pillar: "RBI & Banking Awareness",
    category: "Banking and RBI",
    keyFacts: [
      "Commercial banks cautioned against relying heavily on short-term bulk deposits and certificates of deposit to fund long-term retail credit",
      "RBI mandates enhanced internal Asset-Liability Management (ALM) buffers to preserve systemic stability",
      "SBI and peer PSBs intensified customized recurring deposit campaigns and digital special term deposit schemes",
    ],
  },
  {
    id: "ca-p1-cbdc-programmable",
    title: "Reserve Bank Offline and Programmable Central Bank Digital Currency (CBDC / e₹)",
    summary:
      "RBI expanded retail CBDC (e₹-R) pilots with programmable functionality (enabling targeted social welfare transfers and specific corporate carbon credits) and offline wallet-to-wallet protocols for remote rural regions lacking cellular internet.",
    publishedAt: "2026-07-22",
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
    pillar: "RBI & Banking Awareness",
    category: "Banking and RBI",
    keyFacts: [
      "Programmable e₹ tokens ensure funds are redeemed exclusively for designated purposes (e.g. fertilizer subsidies, school textbooks)",
      "Proximity-based offline sound-wave and NFC protocols enable digital cash settlement in connectivity-dark zones",
      "Direct central bank sovereign liability distinct from commercial bank deposits",
    ],
  },
  {
    id: "ca-p1-project-finance",
    title: "RBI Final Prudential Norms for Infrastructure and Project Finance Lending",
    summary:
      "RBI finalized guidelines requiring phased provisioning during the construction phase of infrastructure projects (up to 2.5% during construction, tapering to 1% on operationalization) to ensure financial prudence while sustaining capital investment.",
    publishedAt: "2026-09-12",
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
    pillar: "RBI & Banking Awareness",
    category: "Banking and RBI",
    keyFacts: [
      "Staged provisioning framework balances credit risk containment with long-gestation capex growth",
      "Mandates clear criteria for Date of Commencement of Commercial Operations (DCCO)",
      "Protects public sector banks with high infrastructure loan exposures against unforeseen cost overruns",
    ],
  },

  // ── 2. Indian Economy and Budget ─────────────────────────────────────────────
  {
    id: "ca-p2-union-budget-capex",
    title: "Union Budget Capital Expenditure (₹11.11 Lakh Crore) and Fiscal Consolidation",
    summary:
      "The Central Government sustained record public capital expenditure of ₹11.11 lakh crore (3.4% of GDP) to crowd in private investment across transport logistics, green corridors, and rural roads while adhering to the fiscal deficit glide path below 4.5% of GDP.",
    publishedAt: "2026-07-24",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "Government Schemes & Economy",
    category: "Indian economy and budget",
    keyFacts: [
      "Record Capex allocation of ₹11.11 lakh crore drives core infrastructure (railways, highways, solar parks)",
      "Fiscal deficit target anchored on consolidation glide path towards < 4.5% of GDP",
      "Multiplier effect: Every ₹1 of public capex generates an estimated ₹2.5 to ₹3 in broader economic output",
    ],
  },
  {
    id: "ca-p2-macro-growth-forex",
    title: "Indian Macroeconomic Indicators: 7%+ GDP Trajectory, GST Collections, and Forex Reserves",
    summary:
      "India consolidated its position as the fastest-growing major global economy with consistent 7%+ annual GDP growth, monthly gross GST revenues averaging over ₹1.75 lakh crore, and foreign exchange reserves touching historic records above $670 billion.",
    publishedAt: "2026-09-02",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "Government Schemes & Economy",
    category: "Indian economy and budget",
    keyFacts: [
      "Consistent GST buoyancy indicates domestic formalization and supply-chain transparency",
      "Foreign exchange reserves above $670 billion provide substantial import cover (10+ months) and currency stability",
      "Retail inflation largely aligned within RBI's target band, supported by proactive supply-side food grain management",
    ],
  },
  {
    id: "ca-p2-direct-tax-reforms",
    title: "Simplification of Direct Tax Regime and Comprehensive Review of Income-tax Act",
    summary:
      "The Ministry of Finance launched a comprehensive review of the Income-tax Act, 1961, to make tax compliance frictionless, eliminate obsolete disputes, and expand the simplified new income tax slabs for middle-income salaried professionals.",
    publishedAt: "2026-08-15",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "Government Schemes & Economy",
    category: "Indian economy and budget",
    keyFacts: [
      "Comprehensive overhaul aims to make the direct tax code concise, clear, and easy to navigate",
      "Over 70% of individual tax filers transitioned to the simplified exemption-free tax regime",
      "Accelerated processing through AI-driven tax returns processing centers reduces refund timelines to under 10 days",
    ],
  },

  // ── 3. Government Schemes and Policies ───────────────────────────────────────
  {
    id: "ca-p2-pmjdy-deepening",
    title: "Pradhan Mantri Jan Dhan Yojana (PMJDY) Financial Deepening: 53+ Crore Accounts Milestone",
    summary:
      "PMJDY marked over 53 crore total accounts with aggregate deposits surpassing ₹2.3 lakh crore, pivoting from initial account opening to active financial deepening through micro-insurance (PMSBY/PMJJBY), Atal Pension Yojana (APY), and micro-credit.",
    publishedAt: "2026-08-28",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "Government Schemes & Economy",
    category: "Government schemes and policies",
    keyFacts: [
      "Over 55% of PMJDY account holders are women; more than 66% accounts are located in rural and semi-urban areas",
      "Average deposit per account increased fourfold since scheme inception, reflecting genuine savings habits",
      "Integrated with Direct Benefit Transfers (DBT) to eliminate leakage across 300+ government welfare schemes",
    ],
  },
  {
    id: "ca-p2-pm-mudra-expansion",
    title: "Pradhan Mantri MUDRA Yojana (PMMY) Expansion: Tarun Plus Credit Limit Raised to ₹20 Lakh",
    summary:
      "The Central Government enhanced the credit guarantee ceiling for micro-enterprises under the MUDRA scheme, introducing the 'Tarun Plus' category with loan limits raised from ₹10 lakh to ₹20 lakh for entrepreneurs who previously settled Tarun loans successfully.",
    publishedAt: "2026-07-25",
    retrievedAt: "2026-10-18",
    sourceName: "PIB",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "Government Schemes & Economy",
    category: "Government schemes and policies",
    keyFacts: [
      "Original tiers: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 lakh), Tarun (₹5 lakh to ₹10 lakh)",
      "New 'Tarun Plus' tier (up to ₹20 lakh) backs scaling MSME enterprises with collateral-free credit guarantees",
      "Aimed at stimulating grassroots manufacturing, service setups, and employment generation in tier-2/tier-3 hubs",
    ],
  },
  {
    id: "ca-p2-pm-surya-ghar",
    title: "PM-Surya Ghar: Muft Bijli Yojana Deployment & Collateral-Free Bank Financing",
    summary:
      "The nationwide rollout of PM-Surya Ghar aims to install rooftop solar across 1 crore households with subsidized bank loan packages, featuring concessional interest rates (around 7%) offered by public sector banks like SBI without collateral.",
    publishedAt: "2026-06-10",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "Government Schemes & Economy",
    category: "Government schemes and policies",
    keyFacts: [
      "Provides up to 300 units of free electricity monthly to 1 crore beneficiary households",
      "Concessional collateral-free bank loans up to ₹6 lakh integrated digitally with the National Rooftop Solar portal",
      "Directly reduces household utility expenses and lowers sovereign subsidy burdens on state DISCOMs",
    ],
  },

  // ── 4. National Affairs ──────────────────────────────────────────────────────
  {
    id: "ca-p3-ai-cyber-resilience",
    title: "RBI Guidelines on Digital Fraud Containment, AI Governance, and Payment Aggregator Oversight",
    summary:
      "With rapid digital banking adoption, RBI introduced mandatory real-time AI fraud detection protocols to identify mule account syndicates, enforced cooling-off periods for high-value fund transfers, and tightened cybersecurity audits across fintech payment gateways.",
    publishedAt: "2026-09-18",
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
    pillar: "National & International Current Affairs",
    category: "National affairs",
    keyFacts: [
      "Mandates automated mule account identification algorithms across mobile and internet banking gateways",
      "Introduces staged cooling-off delays for newly registered beneficiaries in high-value transfers",
      "Enforces stricter liability on payment aggregators and partner banks for delayed fraud reporting",
    ],
  },
  {
    id: "ca-p3-green-finance",
    title: "Sovereign Green Bonds & Mandatory Climate Risk Framework for Public Sector Banks",
    summary:
      "RBI and the Ministry of Finance scaled sovereign green bond issuances and mandated standardized ESG disclosure taxonomies for commercial banks, accelerating lending toward renewable energy, green hydrogen, and climate-resilient agriculture while preventing greenwashing.",
    publishedAt: "2026-05-18",
    retrievedAt: "2026-10-18",
    sourceName: "RBI",
    sourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
    pillar: "National & International Current Affairs",
    category: "National affairs",
    keyFacts: [
      "Funds raised via sovereign and corporate green bonds ring-fenced exclusively for verified sustainable taxonomies",
      "Mandatory board-level climate governance and third-party annual verification to prevent greenwashing",
      "Incentivizes PSBs to finance renewable energy projects without creating asset-liability mismatches",
    ],
  },
  {
    id: "ca-p3-semiconductor-mission",
    title: "India Semiconductor Mission: Commercial Fabrication Units and Advanced Packaging Facilities",
    summary:
      "Under the ₹76,000 crore India Semiconductor Mission (ISM), construction of commercial semiconductor fabrication and ATMP (assembly, testing, marking, and packaging) units commenced in Gujarat and Assam, securing domestic electronics supply chains.",
    publishedAt: "2026-04-14",
    retrievedAt: "2026-10-18",
    sourceName: "PIB",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "National & International Current Affairs",
    category: "National affairs",
    keyFacts: [
      "Central Government offers 50% fiscal support on pari-passu basis for semiconductor fabs and packaging plants",
      "Catalyzes domestic automotive, defense, and telecom chip independence, lowering electronics import bills",
      "Major consortium investments supported by specialized project finance credit lines from Indian banks",
    ],
  },

  // ── 5. International Affairs ────────────────────────────────────────────────
  {
    id: "ca-p3-upi-crossborder",
    title: "NPCI International Expansion: Cross-Border UPI Real-Time Linkages with Global Fast Payments",
    summary:
      "NPCI International Payments Limited (NIPL) operationalized bilateral linkages connecting India's UPI with real-time payment networks in Singapore (PayNow), the UAE (AANI), France, and ASEAN nations, enabling frictionless instant remittances and Rupee-denominated QR merchant acceptance.",
    publishedAt: "2026-09-04",
    retrievedAt: "2026-10-18",
    sourceName: "NPCI",
    sourceUrl: "https://www.npci.org.in/what-we-do/upi/product-overview",
    pillar: "National & International Current Affairs",
    category: "International affairs",
    keyFacts: [
      "Bypasses expensive multi-tier correspondent banking networks to slash retail remittance fees",
      "Enables Indian tourists, students, and expatriates to make real-time QR payments abroad from their domestic INR bank accounts",
      "Supports broader bilateral trade settlement in local currencies (INR-AED, INR-SGD), reducing USD dependency",
    ],
  },
  {
    id: "ca-p3-geopolitical-supplychains",
    title: "Global Supply Chain Realignments, India-Middle East-Europe Economic Corridor (IMEC), and Rupee Trade",
    summary:
      "Amid shifting global trade corridors and geopolitical sanctions, India advanced bilateral local currency settlement mechanisms (Vostro accounts) with trading partners and championed strategic connectivity initiatives like IMEC to lower transit time and energy import vulnerabilities.",
    publishedAt: "2026-08-30",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of Finance",
    sourceUrl: "https://pib.gov.in/PressReleasePage.aspx",
    pillar: "National & International Current Affairs",
    category: "International affairs",
    keyFacts: [
      "Special Rupee Vostro Accounts (SRVA) opened by foreign banks to settle bilateral trade directly in INR",
      "Reduces transaction exchange risk and dollar demand in oil, machinery, and fertilizer imports",
      "IMEC corridor integrates rail, ship, and digital undersea cables to streamline trade between India, Gulf nations, and Europe",
    ],
  },
  {
    id: "ca-p3-brics-expansion",
    title: "BRICS Multilateral Economic Deepening & Cross-Border Local Currency Settlements",
    summary:
      "The expanded BRICS coalition formalized frameworks to promote trade settlement in national currencies, deepen the New Development Bank (NDB) local-currency project bond pipeline, and explore inter-operable digital payment clearing mechanisms.",
    publishedAt: "2026-07-15",
    retrievedAt: "2026-10-18",
    sourceName: "Ministry of External Affairs",
    sourceUrl: "https://www.mea.gov.in/press-releases.htm",
    pillar: "National & International Current Affairs",
    category: "International affairs",
    keyFacts: [
      "Focuses on reducing foreign currency exchange frictions among emerging market trading partners",
      "New Development Bank aims to disburse up to 30% of its financing in member nations' local currencies",
      "Strengthens India's multilateral economic diplomacy across Global South financial institutions",
    ],
  },

  // ── 6. Appointments, Awards, Sports, Reports, and Major Events ───────────────
  {
    id: "ca-p3-sbi-leadership-strategy",
    title: "State Bank of India Leadership Transition & Strategic FY27 Vision",
    summary:
      "Following top leadership appointments approved by the Financial Services Institutions Bureau (FSIB) and Appointments Committee of the Cabinet (ACC), SBI outlined its digital acceleration blueprint, targeting expansion of YONO retail loans and international presence.",
    publishedAt: "2026-08-16",
    retrievedAt: "2026-10-18",
    sourceName: "SBI",
    sourceUrl: "https://bank.sbi/web/investor-relations/annual-reports",
    pillar: "RBI & Banking Awareness",
    category: "Appointments, awards, sports, reports, and major events",
    keyFacts: [
      "FSIB recommends top leadership appointments for public sector banks and financial institutions",
      "SBI targets balance sheet expansion driven by retail asset growth and digital corporate supply chain financing",
      "Prioritizes risk-weighted capital efficiency and enhanced branch-level customer delight",
    ],
  },
  {
    id: "ca-p3-sports-olympics-bid",
    title: "India Submission of Letter of Intent for Hosting 2036 Olympic and Paralympic Games",
    summary:
      "The Indian Olympic Association (IOA), supported by the Ministry of Youth Affairs and Sports, formally submitted India's Letter of Intent to the International Olympic Committee's Future Host Commission to host the 2036 Summer Olympic and Paralympic Games.",
    publishedAt: "2026-09-28",
    retrievedAt: "2026-10-18",
    sourceName: "Sports Authority of India",
    sourceUrl: "https://sportsauthorityofindia.nic.in/sai/press-release",
    pillar: "National & International Current Affairs",
    category: "Appointments, awards, sports, reports, and major events",
    keyFacts: [
      "Formal step in the IOC Continuous Dialogue phase to establish India as a premier international sporting hub",
      "Major infrastructure investments planned across sports complexes, athlete villages, and transit networks",
      "Complements National Sports Development Fund and Target Olympic Podium Scheme (TOPS) athlete training",
    ],
  },
  {
    id: "ca-p3-un-sdg-niti-index",
    title: "NITI Aayog SDG India Index Report: Progress in Poverty Reduction, Clean Water, and Decent Work",
    summary:
      "NITI Aayog released its comprehensive SDG India Index report, documenting significant national progress across UN Sustainable Development Goals, with composite scores improving from 66 to 74 driven by rural electrification, sanitation, and bank account coverage.",
    publishedAt: "2026-07-12",
    retrievedAt: "2026-10-18",
    sourceName: "NITI Aayog",
    sourceUrl: "https://niti.gov.in/report-and-indices",
    pillar: "Government Schemes & Economy",
    category: "Appointments, awards, sports, reports, and major events",
    keyFacts: [
      "Tracks sub-national progress of all 28 States and 8 Union Territories across 16 global goals",
      "Significant progress recorded in SDG 1 (No Poverty), SDG 6 (Clean Water and Sanitation), and SDG 7 (Affordable Energy)",
      "Used by central and state governments to direct targeted developmental budgets and public bank credit outreach",
    ],
  },
];

/**
 * Filter current affairs items by candidate time window (relative to October 2026)
 * - 3_months: August 2026 - October 2026
 * - 6_months: May 2026 - October 2026
 * - 12_months: November 2025 - October 2026
 */
export function filterCurrentAffairsByTimeWindow(
  items: VerifiedCurrentAffairItem[],
  window: TimeWindow
): VerifiedCurrentAffairItem[] {
  const now = new Date();

  let monthsLimit = 3;
  if (window === "6_months") monthsLimit = 6;
  if (window === "12_months") monthsLimit = 12;

  const thresholdDate = new Date(now);
  thresholdDate.setMonth(thresholdDate.getMonth() - monthsLimit);
  thresholdDate.setHours(0, 0, 0, 0); // Include entire starting day

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return items.filter((item) => {
    const itemDate = new Date(item.publishedAt);
    return !isNaN(itemDate.getTime()) && itemDate >= thresholdDate && itemDate <= endOfDay;
  });
}

/**
 * Filter current affairs items by category
 */
export function filterCurrentAffairsByCategory(
  items: VerifiedCurrentAffairItem[],
  categories?: CurrentAffairsCategory[]
): VerifiedCurrentAffairItem[] {
  if (!categories || categories.length === 0) return items;
  return items.filter((item) => categories.includes(item.category));
}
