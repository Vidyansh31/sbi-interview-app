import { KnowledgeChunk, BankingAwarenessQuestion } from "./bankingAwarenessTypes";
import rawKnowledge from "@/data/bankingAwarenessKnowledge.json";
import rawPreGeneratedQuestions from "@/data/preGeneratedQuestions.json";

export const BANKING_AWARENESS_CHUNKS: KnowledgeChunk[] = rawKnowledge as KnowledgeChunk[];
export const PRE_GENERATED_QUESTIONS: BankingAwarenessQuestion[] = rawPreGeneratedQuestions as BankingAwarenessQuestion[];

/**
 * Selects an instant verified question from preGeneratedQuestions that hasn't been asked yet.
 */
export function getInstantGroundedQuestion(excludedQuestions: string[] = []): BankingAwarenessQuestion | null {
  if (!PRE_GENERATED_QUESTIONS || PRE_GENERATED_QUESTIONS.length === 0) {
    return null;
  }

  const normalizedExcluded = new Set(
    excludedQuestions.map((q) => q.trim().toLowerCase())
  );

  const available = PRE_GENERATED_QUESTIONS.filter(
    (item) => !normalizedExcluded.has(item.question.trim().toLowerCase())
  );

  if (available.length === 0) {
    // All pregenerated bank questions have been exhausted by the candidate.
    // Return null so the API generates completely new questions dynamically from the 217 PDF chunks!
    return null;
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Selects an intelligent diverse chunk for question generation, avoiding recently asked chunkIds
 */
export function getDiverseChunk(excludedChunkIds: string[] = []): KnowledgeChunk {
  const eligibleChunks = BANKING_AWARENESS_CHUNKS.filter(
    (chunk) => !excludedChunkIds.includes(chunk.id)
  );

  // If all or almost all chunks have been visited, reset pool
  const pool = eligibleChunks.length > 5 ? eligibleChunks : BANKING_AWARENESS_CHUNKS;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function getChunkById(id: string): KnowledgeChunk | undefined {
  return BANKING_AWARENESS_CHUNKS.find((c) => c.id === id);
}
