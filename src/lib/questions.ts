/**
 * Interview Question Categories for SBI PO Panel Preparation
 */
export type InterviewCategory =
  | "Personal & HR"
  | "Banking Awareness & RBI"
  | "SBI & Digital Banking"
  | "Situational Judgment"
  | "Current Affairs";

/**
 * Structured Interview Question Definition
 */
export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  question: string;
  isCurrentAffairs: boolean;
  hint?: string;
}

/**
 * Structured Evaluation Feedback from Gemini evaluation API
 */
export interface EvaluationFeedback {
  score: number;
  relevance: string;
  bankingKnowledge: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
  followUpQuestion: string;
}

/**
 * Represents a single turn in an interview session
 */
export interface InterviewTurn {
  turnId: string;
  questionId?: string;
  mainQuestionId?: string;
  category: InterviewCategory;
  question: string;
  isFollowUp: boolean;
  followUpIndex?: number;
  answer: string;
  feedback?: EvaluationFeedback;
  timestamp: number;
}

/**
 * Curated Question Bank for SBI PO Phase-III Interviews
 *
 * Designed to cover authentic panel question patterns without relying on
 * volatile, time-sensitive statistics or policy rates.
 */
export const QUESTION_BANK: InterviewQuestion[] = [
  // ── 1. Personal & HR ─────────────────────────────────────────────────────────
  {
    id: "hr-001",
    category: "Personal & HR",
    question: "Please introduce yourself and tell us why you want to join the State Bank of India.",
    isCurrentAffairs: false,
    hint: "Highlight your academic background, core strengths, and a clear reason for choosing SBI over other public and private sector banks.",
  },
  {
    id: "hr-002",
    category: "Personal & HR",
    question: "How does your academic background equip you to handle the responsibilities of a Probationary Officer?",
    isCurrentAffairs: false,
    hint: "Connect your specific discipline (Engineering, Commerce, Science, Arts) to analytical problem solving, financial aptitude, or customer engagement.",
  },
  {
    id: "hr-003",
    category: "Personal & HR",
    question: "A Probationary Officer is subject to pan-India transfers and rural postings. How prepared are you to adapt to rural branch environments?",
    isCurrentAffairs: false,
    hint: "Demonstrate cultural adaptability, willingness to serve in remote branches, and appreciation of grassroots banking.",
  },
  {
    id: "hr-004",
    category: "Personal & HR",
    question: "What are your greatest professional strengths, and what is one area you are actively working to improve?",
    isCurrentAffairs: false,
    hint: "Choose a genuine area of improvement with concrete steps you have taken, and back your strengths with tangible examples.",
  },
  {
    id: "hr-005",
    category: "Personal & HR",
    question: "Where do you see yourself in the State Bank of India five to seven years from now?",
    isCurrentAffairs: false,
    hint: "Show an understanding of SBI's career progression hierarchy (Branch Manager, AGM track) and continuous learning opportunities.",
  },

  // ── 2. Banking Awareness & RBI ──────────────────────────────────────────────
  {
    id: "bank-001",
    category: "Banking Awareness & RBI",
    question: "What is the primary role of the Reserve Bank of India, and how does monetary policy influence inflation and credit growth in the economy?",
    isCurrentAffairs: false,
    hint: "Explain the transmission mechanism through policy rates, liquidity management, and how commercial bank lending rates respond.",
  },
  {
    id: "bank-002",
    category: "Banking Awareness & RBI",
    question: "Explain the concept of Non-Performing Assets (NPAs). What are the key stages of asset classification and standard recovery mechanisms available to banks?",
    isCurrentAffairs: false,
    hint: "Mention SMA categories, the 90-day delinquency norm for Sub-standard/Doubtful/Loss assets, and mechanisms like SARFAESI, DRTs, and IBC.",
  },
  {
    id: "bank-003",
    category: "Banking Awareness & RBI",
    question: "What is Priority Sector Lending (PSL), and why does the RBI mandate commercial banks to allocate a specific portion of their credit to it?",
    isCurrentAffairs: false,
    hint: "Highlight sectors like Agriculture, MSME, Education, and Housing, explaining the socio-economic goal of equitable credit distribution.",
  },
  {
    id: "bank-004",
    category: "Banking Awareness & RBI",
    question: "What is the Capital Adequacy Ratio (CAR) under Basel III norms, and why is maintaining adequate capital reserves critical for public sector banks?",
    isCurrentAffairs: false,
    hint: "Discuss Tier-1 and Tier-2 capital relative to risk-weighted assets, and how it shields the bank against unexpected credit or market shocks.",
  },
  {
    id: "bank-005",
    category: "Banking Awareness & RBI",
    question: "Differentiate between Cash Reserve Ratio (CRR) and Statutory Liquidity Ratio (SLR). How do changes in these ratios impact a bank's lendable resources?",
    isCurrentAffairs: false,
    hint: "Clarify that CRR is held in cash with the RBI earning no interest, while SLR is maintained in approved securities and liquid assets.",
  },

  // ── 3. SBI & Digital Banking ────────────────────────────────────────────────
  {
    id: "sbi-001",
    category: "SBI & Digital Banking",
    question: "What distinctive advantages does the State Bank of India possess compared to new-age private sector lenders and FinTech firms?",
    isCurrentAffairs: false,
    hint: "Focus on SBI's immense branch and ATM network, sovereign trust, diverse customer base, foreign presence, and comprehensive digital ecosystem.",
  },
  {
    id: "sbi-002",
    category: "SBI & Digital Banking",
    question: "How has SBI's flagship platform YONO transformed retail banking and customer acquisition across both urban and rural demographics?",
    isCurrentAffairs: false,
    hint: "Discuss integration of banking, investment, and lifestyle shopping, along with paperless account opening and pre-approved personal loans.",
  },
  {
    id: "sbi-003",
    category: "SBI & Digital Banking",
    question: "What role does the State Bank of India play in driving national financial inclusion through Business Correspondents and the Pradhan Mantri Jan Dhan Yojana (PMJDY)?",
    isCurrentAffairs: false,
    hint: "Emphasize last-mile banking connectivity, micro-insurance (PMSBY, PMJJBY), zero-balance savings accounts, and direct benefit transfers (DBT).",
  },
  {
    id: "sbi-004",
    category: "SBI & Digital Banking",
    question: "As digital banking transactions via UPI, mobile banking, and internet banking surge, what are the foremost cybersecurity challenges facing commercial banks?",
    isCurrentAffairs: false,
    hint: "Address social engineering/phishing risks, SIM swapping, multi-factor authentication, customer awareness, and 24x7 fraud monitoring systems.",
  },
  {
    id: "sbi-005",
    category: "SBI & Digital Banking",
    question: "What is the concept of Central Bank Digital Currency (CBDC / Digital Rupee), and how does it differ from traditional retail UPI payments?",
    isCurrentAffairs: false,
    hint: "Explain that CBDC represents sovereign central bank liability (digital cash) whereas UPI is an inter-bank account-to-account funds transfer rail.",
  },

  // ── 4. Situational Judgment ─────────────────────────────────────────────────
  {
    id: "sit-001",
    category: "Situational Judgment",
    question: "An agitated senior citizen visits your branch complaining that money was debited from their savings account without their authorization. As an officer, how would you handle the situation?",
    isCurrentAffairs: false,
    hint: "Prioritize empathy and calming the customer, immediately block the compromised channel (card/net banking), initiate chargeback/dispute logging, and guide them on cybercrime reporting.",
  },
  {
    id: "sit-002",
    category: "Situational Judgment",
    question: "You discover an inadvertent clerical discrepancy in a daily branch cash balancing ledger at closing time. How do you address this issue?",
    isCurrentAffairs: false,
    hint: "Stress transparency, immediate reporting to the Branch Manager/Chief Associate, joint verification of vouchers and teller logs, and adherence to audit protocols rather than concealing discrepancies.",
  },
  {
    id: "sit-003",
    category: "Situational Judgment",
    question: "A high-net-worth customer insists on getting a loan sanctioned immediately, requesting you to waive a mandatory KYC document. How would you respond?",
    isCurrentAffairs: false,
    hint: "Uphold regulatory compliance and statutory RBI/SBI KYC mandates politely but firmly, explaining that compliance safeguards both the customer and the institution.",
  },
  {
    id: "sit-004",
    category: "Situational Judgment",
    question: "Due to a localized server connectivity failure during peak morning hours, a long queue of customers becomes frustrated in the branch. What steps will you take to manage the crowd and maintain service?",
    isCurrentAffairs: false,
    hint: "Communicate clearly about the downtime, segregate offline inquiries from online transactions, provide water/seating, and notify IT helpdesks while reassuring waiting customers.",
  },
  {
    id: "sit-005",
    category: "Situational Judgment",
    question: "Your branch has been assigned aggressive quarterly targets for a newly launched third-party insurance product. How do you balance meeting business targets while avoiding misselling?",
    isCurrentAffairs: false,
    hint: "Emphasize need-based selling, transparent explanation of policy terms, customer consent, and ensuring products genuinely suit the customer's financial risk profile.",
  },

  // ── 5. Current Affairs (Grounded in Verified Official Data) ─────────────────
  {
    id: "ca-001",
    category: "Current Affairs",
    question: "The Reserve Bank of India has recently formalized guidelines for digital lending and default loss guarantees (DLG). In your view, why was this regulatory intervention critical for protecting retail borrowers and banking stability?",
    isCurrentAffairs: true,
    hint: "Mention the 5% cap on DLG, preventing shadow balance sheets, ensuring regulated entities own the credit risk, requiring Key Fact Statements (KFS), and curbing aggressive recovery practices by unapproved third-party lending apps.",
  },
  {
    id: "ca-002",
    category: "Current Affairs",
    question: "RBI is rolling out the Unified Lending Interface (ULI) across India. How can ULI transform rural lending and credit appraisal for agricultural and MSME borrowers at public sector banks like SBI?",
    isCurrentAffairs: true,
    hint: "Explain how ULI integrates digitized land registries, satellite imagery, dairy metrics, and GST data with customer consent to slash appraisal turnaround times and lower transaction costs for rural credit.",
  },
  {
    id: "ca-003",
    category: "Current Affairs",
    question: "NPCI has been expanding cross-border linkages for UPI with nations like Singapore, the UAE, and France. What strategic benefits does internationalizing UPI offer to Indian expatriates and India's trade economy?",
    isCurrentAffairs: true,
    hint: "Discuss lower transaction fees compared to correspondent banking, instant inward remittances, promoting bilateral trade settlement in INR, and establishing India's digital public infrastructure as a global benchmark.",
  },
  {
    id: "ca-004",
    category: "Current Affairs",
    question: "With RBI mandating rigorous guidelines for Green Deposits, how can public sector banks balance growing their sustainable finance portfolio while preventing 'greenwashing'?",
    isCurrentAffairs: true,
    hint: "Discuss transparent end-use tracking towards designated sectors (renewables, clean mobility), mandatory board-level climate policies, and independent third-party verification to maintain investor and depositor trust.",
  },
  {
    id: "ca-005",
    category: "Current Affairs",
    question: "Pradhan Mantri Jan Dhan Yojana (PMJDY) recently marked a milestone with over 53 crore accounts and ₹2.3 lakh crore in deposits. What are the key operational and financial challenges banks now face in deepening active usage among these account holders?",
    isCurrentAffairs: true,
    hint: "Highlight moving from basic zero-balance opening to financial deepening: promoting micro-insurance, micro-pensions (APY), Rupay debit card activations, preventing dormant accounts, and financial literacy at rural branches.",
  },
];

/**
 * Helper to retrieve questions filtered by category
 */
export function getQuestionsByCategory(category: InterviewCategory): InterviewQuestion[] {
  return QUESTION_BANK.filter((q) => q.category === category);
}

/**
 * Helper to retrieve a single question by its unique identifier
 */
export function getQuestionById(id: string): InterviewQuestion | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

/**
 * Helper to retrieve all static question categories with count metrics
 */
export function getCategoryCounts(): Record<InterviewCategory, number> {
  const counts: Record<InterviewCategory, number> = {
    "Personal & HR": 0,
    "Banking Awareness & RBI": 0,
    "SBI & Digital Banking": 0,
    "Situational Judgment": 0,
    "Current Affairs": 0,
  };

  for (const q of QUESTION_BANK) {
    counts[q.category] = (counts[q.category] || 0) + 1;
  }

  return counts;
}

/**
 * Fisher-Yates shuffle helper to randomly select items without replacement
 */
function sampleWithoutReplacement<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * Builds a deterministic initial 10-question mock interview session covering all 5 core categories.
 * Safe for Next.js SSR / static prerender.
 */
export function buildBalancedInterviewSession(): InterviewQuestion[] {
  const hr = getQuestionsByCategory("Personal & HR").slice(0, 2);
  const banking = getQuestionsByCategory("Banking Awareness & RBI").slice(0, 2);
  const sbi = getQuestionsByCategory("SBI & Digital Banking").slice(0, 2);
  const situational = getQuestionsByCategory("Situational Judgment").slice(0, 2);
  const currentAffairs = getQuestionsByCategory("Current Affairs").slice(0, 2);

  return [
    ...hr,             // Q1, Q2
    ...banking,        // Q3, Q4
    ...sbi,            // Q5, Q6
    ...situational,    // Q7, Q8
    ...currentAffairs, // Q9, Q10
  ];
}

/**
 * Builds a dynamic, randomized 10-question mock interview session covering all 5 core categories:
 * - 2 × Personal & HR (sampled without replacement)
 * - 2 × Banking Awareness & RBI (sampled without replacement)
 * - 2 × SBI & Digital Banking (sampled without replacement)
 * - 2 × Situational Judgment (sampled without replacement)
 * - 2 × Current Affairs (sampled without replacement)
 *
 * Guarantees that no questions repeat within the 10-question set and every session is fresh and dynamic.
 * Should be called inside useEffect or client event handlers to avoid Next.js prerender errors.
 */
export function buildRandomizedSession(): InterviewQuestion[] {
  const hr = sampleWithoutReplacement(getQuestionsByCategory("Personal & HR"), 2);
  const banking = sampleWithoutReplacement(getQuestionsByCategory("Banking Awareness & RBI"), 2);
  const sbi = sampleWithoutReplacement(getQuestionsByCategory("SBI & Digital Banking"), 2);
  const situational = sampleWithoutReplacement(getQuestionsByCategory("Situational Judgment"), 2);
  const currentAffairs = sampleWithoutReplacement(getQuestionsByCategory("Current Affairs"), 2);

  return [
    ...hr,             // Q1, Q2 (Dynamic & Non-repeating)
    ...banking,        // Q3, Q4 (Dynamic & Non-repeating)
    ...sbi,            // Q5, Q6 (Dynamic & Non-repeating)
    ...situational,    // Q7, Q8 (Dynamic & Non-repeating)
    ...currentAffairs, // Q9, Q10 (Dynamic & Non-repeating)
  ];
}
