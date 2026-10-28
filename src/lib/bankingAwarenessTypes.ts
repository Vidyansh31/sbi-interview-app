export interface KnowledgeChunk {
  id: string;
  chunkIndex: number;
  approxPage: number;
  title: string;
  content: string;
}

export type QuestionType = "definition" | "factual" | "conceptual" | "scenario";

export interface BankingAwarenessQuestion {
  id: string;
  chunkId: string;
  approxPage: number;
  topic: string;
  questionType: QuestionType;
  question: string;
  hint: string;
  expectedKeyPoints: string[];
}

export interface BankingAwarenessEvaluation {
  score: number; // 1 to 10
  feedback: string;
  correctAnswer: string;
  explanation: string;
  pdfReference: {
    chunkId: string;
    approxPage: number;
    verifiableTopic: string;
  };
  strengths: string[];
  improvements: string[];
  followUpQuestion?: string | null;
}

export interface PracticeTurn {
  id: string;
  question: BankingAwarenessQuestion;
  userAnswer: string;
  isFollowUp?: boolean;
  followUpIndex?: number;
  evaluation?: BankingAwarenessEvaluation;
  timestamp: number;
}
