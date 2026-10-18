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
  difficulty?: "easy" | "moderate" | "hard";
  sourceName?: string;
  sourceUrl?: string;
  publishedAt?: string; // Event/publication date
  retrievedAt?: string; // Verified/retrieved date
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
