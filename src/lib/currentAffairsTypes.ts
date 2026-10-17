/**
 * Types and schema for Verified Current Affairs in the SBI PO Interview Coach
 * Covers the 3 mandatory pillars:
 * 1. RBI and Banking Awareness (Monetary policy, repo rate, inflation, banking regulations, NPAs, digital payments)
 * 2. Government Schemes and Economy (Financial inclusion, economic indicators, budgets, initiatives)
 * 3. National and International Current Affairs (Latest 3-6 months + major older events)
 */

export type CurrentAffairsPillar =
  | "RBI & Banking Awareness"
  | "Government Schemes & Economy"
  | "National & International Current Affairs";

export interface VerifiedCurrentAffairItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string; // YYYY-MM-DD
  sourceName: "RBI" | "PIB" | "Ministry of Finance" | "NPCI" | "SBI" | "SEBI" | "NITI Aayog";
  sourceUrl: string;
  pillar: CurrentAffairsPillar;
  keyFacts: string[];
}
