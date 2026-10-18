/**
 * Types and schema for Verified Current Affairs in the SBI PO Interview Coach
 */

export type CurrentAffairsPillar =
  | "RBI & Banking Awareness"
  | "Government Schemes & Economy"
  | "National & International Current Affairs";

export type CurrentAffairsCategory =
  | "Banking and RBI"
  | "Indian economy and budget"
  | "National affairs"
  | "International affairs"
  | "Government schemes and policies"
  | "Appointments, awards, sports, reports, and major events";

export type TimeWindow = "3_months" | "6_months" | "12_months";

export type InterviewDifficulty = "easy" | "moderate" | "hard";

export type InterviewMode = "full_mock" | "current_affairs";

export interface VerifiedCurrentAffairItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string; // YYYY-MM-DD of the event/circular publication
  retrievedAt: string; // YYYY-MM-DD when verified from official source
  sourceName:
    | "RBI"
    | "PIB"
    | "Ministry of Finance"
    | "NPCI"
    | "SBI"
    | "SEBI"
    | "NITI Aayog"
    | "Ministry of External Affairs"
    | "Sports Authority of India"
    | "Election Commission of India";
  sourceUrl: string;
  pillar: CurrentAffairsPillar;
  category: CurrentAffairsCategory;
  keyFacts: string[];
}
