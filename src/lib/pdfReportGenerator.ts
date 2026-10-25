import jsPDF from "jspdf";
import { InterviewTurn, InterviewQuestion } from "./questions";

export interface InterviewReportData {
  overallScore: number;
  answeredCount: number;
  totalSessionQuestions: number;
  completionRate: number;
  answerQualityRate: number;
  overallAssessment: string;
  categoryBreakdown: Array<{
    category: string;
    averageScore: number;
    turnCount: number;
    assessment: string;
  }>;
  strengths: string[];
  improvementAreas: string[];
  priorityTopics: string[];
  answerImprovements: Array<{
    question: string;
    suggestion: string;
  }>;
  readinessAssessment: string;
  interviewMode?: string;
  difficulty?: string;
  timeWindow?: string;
}

interface GeneratePdfOptions {
  report: InterviewReportData;
  sessionTurns: InterviewTurn[];
  sessionQuestions: InterviewQuestion[];
  interviewMode: string;
  difficulty: string;
}

export function generateInterviewReportPdf({
  report,
  sessionTurns,
  sessionQuestions,
  interviewMode,
  difficulty,
}: GeneratePdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 18;

  let y = margin;

  // Helper for page break checks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("SBI PO AI INTERVIEW COACH - EVALUATION REPORT", margin, 9);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, 11, pageWidth - margin, 11);
    y = Math.max(y, 16);
  };

  // Header Banner
  doc.setFillColor(10, 37, 64); // #0a2540 deep navy
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("State Bank of India - Probationary Officer (PO)", margin + 6, y + 9);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(245, 158, 11); // amber-400
  doc.text("AI Interview Performance Evaluation & Detailed Feedback Dossier", margin + 6, y + 15);

  const modeText = `Mode: ${interviewMode === "current_affairs" ? "Current Affairs Special" : "Full Mock Interview"} | Level: ${difficulty.toUpperCase()} | Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(modeText, margin + 6, y + 21);

  y += 31;

  // Score Summary Cards
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 19;

  // Card 1: Overall Score
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("OVERALL SCORE", margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(10, 37, 64);
  doc.text(`${report.overallScore}`, margin + 4, y + 13);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("/ 100", margin + 18, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Exam-Weighted Composite", margin + 4, y + 17);

  // Card 2: Answer Quality
  const card2X = margin + cardWidth + 3;
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("ANSWER QUALITY", card2X + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(`${report.answerQualityRate}%`, card2X + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Average On Attempted Turns", card2X + 4, y + 17);

  // Card 3: Completion Rate
  const card3X = margin + (cardWidth + 3) * 2;
  doc.roundedRect(card3X, y, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("COMPLETION RATE", card3X + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(`${report.completionRate}%`, card3X + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${report.answeredCount} of ${report.totalSessionQuestions} Main Questions`, card3X + 4, y + 17);

  y += cardHeight + 5;

  // Executive Assessment Summary
  if (report.overallAssessment) {
    checkPageBreak(25);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(10, 37, 64);
    doc.text("EXECUTIVE ASSESSMENT", margin, y);
    y += 3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitExec = doc.splitTextToSize(report.overallAssessment, contentWidth - 8);
    const boxH = splitExec.length * 4 + 6;
    doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");
    doc.text(splitExec, margin + 4, y + 4.5);
    y += boxH + 5;
  }

  // Strengths & Improvement Areas
  checkPageBreak(30);
  const colW = (contentWidth - 4) / 2;

  // Left col: Strengths
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text("KEY STRENGTHS", margin, y);

  // Right col: Areas for Improvement
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text("AREAS FOR IMPROVEMENT", margin + colW + 4, y);
  y += 3;

  const strengthsLines = report.strengths && report.strengths.length > 0 
    ? report.strengths.slice(0, 4).map((s) => `• ${s}`) 
    : ["• Continue completing full mock interviews to develop comprehensive baseline strengths."];
  const impLines = report.improvementAreas && report.improvementAreas.length > 0
    ? report.improvementAreas.slice(0, 4).map((s) => `• ${s}`)
    : ["• Attempt all questions across banking and current affairs to maximize your exam score."];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const splitS = doc.splitTextToSize(strengthsLines.join("\n"), colW - 6);
  const splitI = doc.splitTextToSize(impLines.join("\n"), colW - 6);
  const maxLinesH = Math.max(splitS.length, splitI.length) * 3.8 + 6;

  // Left box
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, y, colW, maxLinesH, 2, 2, "FD");
  doc.text(splitS, margin + 3, y + 4.5);

  // Right box
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.roundedRect(margin + colW + 4, y, colW, maxLinesH, 2, 2, "FD");
  doc.text(splitI, margin + colW + 7, y + 4.5);

  y += maxLinesH + 5;

  // Priority Revision Topics
  if (report.priorityTopics && report.priorityTopics.length > 0) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(10, 37, 64);
    doc.text("PRIORITY REVISION TOPICS", margin, y);
    y += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    let topicX = margin;
    for (const topic of report.priorityTopics) {
      const topicText = topic.trim();
      const textWidth = doc.getTextWidth(topicText) + 5;
      if (topicX + textWidth > pageWidth - margin) {
        topicX = margin;
        y += 6;
        checkPageBreak(10);
      }
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(topicX, y, textWidth, 5, 1, 1, "FD");
      doc.text(topicText, topicX + 2.5, y + 3.5);
      topicX += textWidth + 2.5;
    }
    y += 9;
  }

  // Category Breakdown Table
  if (report.categoryBreakdown && report.categoryBreakdown.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(10, 37, 64);
    doc.text("CATEGORY PERFORMANCE BREAKDOWN", margin, y);
    y += 3.5;

    // Header row
    doc.setFillColor(10, 37, 64);
    doc.rect(margin, y, contentWidth, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("Category", margin + 3, y + 3.8);
    doc.text("Turns", margin + contentWidth - 45, y + 3.8);
    doc.text("Avg Score", margin + contentWidth - 25, y + 3.8);
    y += 5.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    report.categoryBreakdown.forEach((cat, idx) => {
      checkPageBreak(7);
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6, "F");
      }
      doc.setTextColor(30, 41, 59);
      doc.text(cat.category, margin + 3, y + 4.2);
      doc.text(`${cat.turnCount}`, margin + contentWidth - 42, y + 4.2);
      
      const scoreColor = cat.averageScore >= 7.5 ? [5, 150, 105] : cat.averageScore >= 5 ? [217, 119, 6] : [220, 38, 38];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`${cat.averageScore.toFixed(1)} / 10`, margin + contentWidth - 25, y + 4.2);
      doc.setFont("helvetica", "normal");
      y += 6;
    });

    y += 4;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Complete Question-by-Question Dossier (ALL 10 Questions + Follow-ups)
  // ─────────────────────────────────────────────────────────────────────────────
  checkPageBreak(30);
  doc.setFillColor(10, 37, 64);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("COMPLETE INTERVIEW DOSSIER (ALL QUESTIONS & EVALUATIONS)", margin + 4, y + 5.5);
  y += 12;

  // Build unified dossier list across all 10 main questions plus any follow-ups asked
  interface DossierItem {
    mainIndex: number;
    questionNumberLabel: string;
    category: string;
    questionText: string;
    candidateAnswer: string;
    isAttempted: boolean;
    isFollowUp: boolean;
    feedback?: {
      score: number;
      relevance: string;
      bankingKnowledge: string;
      strengths: string[];
      improvements: string[];
      suggestedAnswer: string;
    };
    hint?: string;
  }

  const dossierItems: DossierItem[] = [];

  sessionQuestions.forEach((q, mainIdx) => {
    // Check if this main question was answered in sessionTurns
    const matchingTurns = sessionTurns.filter(
      (t) =>
        (t.questionId && t.questionId === q.id) ||
        (t.mainQuestionId && t.mainQuestionId === q.id) ||
        (!t.isFollowUp && t.question.trim().toLowerCase() === q.question.trim().toLowerCase())
    );

    const mainTurn = matchingTurns.find((t) => !t.isFollowUp) || matchingTurns[0];

    if (mainTurn && mainTurn.feedback) {
      dossierItems.push({
        mainIndex: mainIdx + 1,
        questionNumberLabel: `QUESTION ${mainIdx + 1} of ${sessionQuestions.length}`,
        category: q.category,
        questionText: q.question,
        candidateAnswer: mainTurn.answer || "",
        isAttempted: true,
        isFollowUp: false,
        feedback: mainTurn.feedback,
        hint: q.hint,
      });

      // Follow-ups triggered for this question
      const followUpTurns = matchingTurns.filter((t) => t.isFollowUp);
      followUpTurns.forEach((fuTurn, fuIdx) => {
        dossierItems.push({
          mainIndex: mainIdx + 1,
          questionNumberLabel: `FOLLOW-UP ${fuTurn.followUpIndex || fuIdx + 1} (to Q${mainIdx + 1})`,
          category: q.category,
          questionText: fuTurn.question,
          candidateAnswer: fuTurn.answer || "",
          isAttempted: Boolean(fuTurn.feedback),
          isFollowUp: true,
          feedback: fuTurn.feedback,
        });
      });
    } else {
      // Unanswered / Skipped main question
      dossierItems.push({
        mainIndex: mainIdx + 1,
        questionNumberLabel: `QUESTION ${mainIdx + 1} of ${sessionQuestions.length} [UNANSWERED / SKIPPED]`,
        category: q.category,
        questionText: q.question,
        candidateAnswer: "",
        isAttempted: false,
        isFollowUp: false,
        hint: q.hint,
      });
    }
  });

  dossierItems.forEach((item) => {
    const isAnswered = item.isAttempted && item.feedback;
    const fb = item.feedback;

    // Calculate height needed for this turn card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const splitQ = doc.splitTextToSize(`Question: ${item.questionText}`, contentWidth - 10);
    const qH = splitQ.length * 3.5 + 2;

    const splitA = doc.splitTextToSize(
      isAnswered
        ? `Candidate Answer: ${item.candidateAnswer}`
        : "Candidate Answer: [Unanswered / Skipped - No response recorded]",
      contentWidth - 12
    );
    const aH = splitA.length * 3.3 + 4;

    const turnHeaderHeight = 6.5;

    let totalCardH = turnHeaderHeight + qH + aH + 6;

    let splitRel: string[] = [];
    let splitKnow: string[] = [];
    let splitModel: string[] = [];
    let subScoresH = 0;
    let strengthsH = 0;
    let modelH = 0;

    if (isAnswered && fb) {
      splitRel = doc.splitTextToSize(`Relevance: ${fb.relevance}`, (contentWidth - 14) / 2);
      splitKnow = doc.splitTextToSize(`Banking Knowledge: ${fb.bankingKnowledge}`, (contentWidth - 14) / 2);
      splitModel = fb.suggestedAnswer ? doc.splitTextToSize(`Suggested Response: ${fb.suggestedAnswer}`, contentWidth - 12) : [];
      subScoresH = Math.max(splitRel.length, splitKnow.length) * 3.3 + 4;
      strengthsH = Math.max(fb.strengths.length, fb.improvements.length) * 3.2 + 6;
      modelH = fb.suggestedAnswer ? splitModel.length * 3.3 + 5 : 0;
      totalCardH += subScoresH + strengthsH + modelH + 5;
    } else {
      // Unanswered guidance box height
      totalCardH += (item.hint ? 12 : 8);
    }

    checkPageBreak(Math.min(totalCardH, 50)); // Ensure header and question fit

    // Header row
    if (isAnswered) {
      doc.setFillColor(10, 37, 64);
    } else {
      doc.setFillColor(71, 85, 105); // slate-600 for skipped/unanswered
    }
    doc.roundedRect(margin, y, contentWidth, turnHeaderHeight, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(245, 158, 11); // amber-400
    doc.text(item.questionNumberLabel, margin + 4, y + 4.5);

    doc.setTextColor(226, 232, 240);
    doc.text(`[${item.category}]`, margin + 65, y + 4.5);

    doc.setTextColor(255, 255, 255);
    if (isAnswered && fb) {
      doc.text(`Score: ${fb.score} / 10`, margin + contentWidth - 24, y + 4.5);
    } else {
      doc.text("Score: 0 / 10", margin + contentWidth - 22, y + 4.5);
    }
    y += turnHeaderHeight + 2;

    // Question text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(10, 37, 64);
    doc.text(splitQ, margin + 4, y + 3);
    y += qH;

    // Candidate answer box
    checkPageBreak(aH + 4);
    if (isAnswered) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
    } else {
      doc.setFillColor(254, 242, 242); // light red/slate for empty
      doc.setDrawColor(254, 202, 202);
    }
    doc.roundedRect(margin + 3, y, contentWidth - 6, aH, 1, 1, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    if (isAnswered) {
      doc.setTextColor(51, 65, 85);
    } else {
      doc.setTextColor(153, 27, 27); // red-800
    }
    doc.text(splitA, margin + 5, y + 3.5);
    y += aH + 2.5;

    if (isAnswered && fb) {
      // Feedback criteria (2 columns: Relevance / Banking Knowledge)
      checkPageBreak(subScoresH + 6);
      const halfW = (contentWidth - 8) / 2;

      // Relevance box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin + 3, y, halfW, subScoresH, 1, 1, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(splitRel, margin + 5, y + 3.2);

      // Banking Knowledge box
      doc.roundedRect(margin + 5 + halfW, y, halfW, subScoresH, 1, 1, "D");
      doc.text(splitKnow, margin + 7 + halfW, y + 3.2);
      y += subScoresH + 2.5;

      // Strengths & Improvements in bullet form
      checkPageBreak(strengthsH + 6);
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin + 3, y, halfW, strengthsH, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(5, 150, 105);
      doc.text("Strengths:", margin + 5, y + 3.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      let sY = y + 6;
      fb.strengths.slice(0, 3).forEach((s) => {
        const splitBullet = doc.splitTextToSize(`• ${s}`, halfW - 4);
        doc.text(splitBullet, margin + 5, sY);
        sY += splitBullet.length * 3;
      });

      // Improvements
      doc.setFillColor(254, 252, 232);
      doc.setDrawColor(254, 240, 138);
      doc.roundedRect(margin + 5 + halfW, y, halfW, strengthsH, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(217, 119, 6);
      doc.text("Areas for Improvement:", margin + 7 + halfW, y + 3.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      let iY = y + 6;
      fb.improvements.slice(0, 3).forEach((imp) => {
        const splitBullet = doc.splitTextToSize(`• ${imp}`, halfW - 4);
        doc.text(splitBullet, margin + 7 + halfW, iY);
        iY += splitBullet.length * 3;
      });

      y += strengthsH + 2.5;

      // Model Answer Box
      if (fb.suggestedAnswer) {
        checkPageBreak(modelH + 6);
        doc.setFillColor(239, 246, 255); // blue-50
        doc.setDrawColor(191, 219, 254); // blue-200
        doc.roundedRect(margin + 3, y, contentWidth - 6, modelH, 1, 1, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(29, 78, 216); // blue-700
        doc.text("Suggested Model Response:", margin + 5, y + 3.2);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.2);
        doc.setTextColor(30, 58, 138); // blue-900
        doc.text(splitModel, margin + 5, y + 6.8);

        y += modelH + 3;
      }
    } else {
      // Unanswered advice & preparation hint
      checkPageBreak(12);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      const hintText = item.hint
        ? `Panel Preparation Guidance & Key Concepts: ${item.hint}`
        : "Panel Preparation Guidance: Review this topic thoroughly in standard banking reference materials.";
      const splitHint = doc.splitTextToSize(hintText, contentWidth - 12);
      const hintH = splitHint.length * 3.3 + 4;
      doc.roundedRect(margin + 3, y, contentWidth - 6, hintH, 1, 1, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(71, 85, 105);
      doc.text(splitHint, margin + 5, y + 3.5);
      y += hintH + 2.5;
    }

    // Line divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Confidential SBI PO AI Interview Evaluation • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Trigger browser download
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  doc.save(`SBI_PO_Interview_Report_${timestamp}.pdf`);
}
