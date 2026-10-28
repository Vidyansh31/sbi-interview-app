import jsPDF from "jspdf";
import { PracticeTurn } from "./bankingAwarenessTypes";

interface GenerateBankingAwarenessPdfOptions {
  sessionTurns: PracticeTurn[];
  totalAttempted: number;
}

export function generateBankingAwarenessPdfReport({
  sessionTurns,
  totalAttempted,
}: GenerateBankingAwarenessPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 16;

  let y = margin;

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
    doc.setTextColor(10, 37, 64);
    doc.text("SBI PO AI COACH  |  BANKING AWARENESS PRACTICE REPORT", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 150, 165);
    doc.text("Source: BBM PRO 2026 Ebook", pageWidth - margin, y, { align: "right" });
    y += 3;
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Header Banner
  doc.setFillColor(10, 37, 64);
  doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("SBI PO Banking Awareness - Practice Session", margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 215, 235);
  const dateStr = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.text(`Generated on ${dateStr}  |  Strictly grounded in BBM PRO 2026 Ebook`, margin + 6, y + 16);

  y += 28;

  // Session Summary Box
  const answeredTurns = sessionTurns.filter((t) => t.userAnswer && t.userAnswer.trim().length > 0);
  const skippedCount = sessionTurns.filter((t) => !t.userAnswer || t.userAnswer.trim().length === 0).length;
  
  const scores = sessionTurns
    .map((t) => t.evaluation?.score)
    .filter((s): s is number => typeof s === "number");
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "N/A";

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Questions Asked: ${sessionTurns.length}`, margin + 5, y + 7);
  doc.text(`Answered: ${answeredTurns.length}`, margin + 65, y + 7);
  doc.text(`Skipped: ${skippedCount}`, margin + 105, y + 7);
  doc.text(`Avg Score: ${avgScore}/10`, margin + 140, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Session Questions Practiced: ${totalAttempted} items`, margin + 5, y + 14);

  y += 26;

  // Question-by-Question Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 37, 64);
  doc.text("Questions & Evaluation Breakdown", margin, y);
  y += 6;

  if (sessionTurns.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No questions were recorded during this session.", margin, y);
  } else {
    sessionTurns.forEach((turn, idx) => {
      checkPageBreak(35);

      const isSkipped = !turn.userAnswer || turn.userAnswer.trim().length === 0;
      const questionNumber = idx + 1;
      const q = turn.question;
      
      // Header for question
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const qTitle = `Q${questionNumber}. [${q.questionType.toUpperCase()}] ${q.topic} (Ebook Page ${q.approxPage})`;
      doc.text(qTitle, margin + 3, y + 4.8);

      if (turn.isFollowUp) {
        doc.setTextColor(194, 65, 12);
        doc.text("[Follow-Up]", pageWidth - margin - 22, y + 4.8);
      } else if (isSkipped) {
        doc.setTextColor(100, 116, 139);
        doc.text("[SKIPPED]", pageWidth - margin - 20, y + 4.8);
      } else if (turn.evaluation) {
        doc.setTextColor(5, 150, 105);
        doc.text(`Score: ${turn.evaluation.score}/10`, pageWidth - margin - 22, y + 4.8);
      }

      y += 11;

      // Question Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const splitQ = doc.splitTextToSize(`Question: ${q.question}`, contentWidth - 6);
      checkPageBreak(splitQ.length * 4.2 + 10);
      doc.text(splitQ, margin + 3, y);
      y += splitQ.length * 4.2 + 2;

      // Candidate's Answer
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Candidate's Answer:", margin + 3, y);
      y += 4;

      doc.setFont("helvetica", isSkipped ? "italic" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(isSkipped ? 148 : 30, isSkipped ? 163 : 41, isSkipped ? 184 : 59);
      const ansText = isSkipped ? "[No answer provided / Skipped]" : turn.userAnswer;
      const splitAns = doc.splitTextToSize(ansText, contentWidth - 8);
      checkPageBreak(splitAns.length * 3.8 + 8);
      doc.text(splitAns, margin + 4, y);
      y += splitAns.length * 3.8 + 3;

      // Evaluation & Correct Answer (from PDF)
      if (turn.evaluation) {
        // Feedback
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(10, 37, 64);
        doc.text("Evaluator Feedback (Based on BBM PRO 2026 Ebook):", margin + 3, y);
        y += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const splitFb = doc.splitTextToSize(turn.evaluation.feedback, contentWidth - 8);
        checkPageBreak(splitFb.length * 3.8 + 6);
        doc.text(splitFb, margin + 4, y);
        y += splitFb.length * 3.8 + 3;

        // Correct Answer
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        doc.text("Correct Answer / Expected Key Points from PDF:", margin + 3, y);
        y += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        const splitCorrect = doc.splitTextToSize(turn.evaluation.correctAnswer, contentWidth - 8);
        checkPageBreak(splitCorrect.length * 3.8 + 6);
        doc.text(splitCorrect, margin + 4, y);
        y += splitCorrect.length * 3.8 + 3;

        // Explanation / Reference
        if (turn.evaluation.explanation) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text("Explanation:", margin + 3, y);
          y += 3.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          const splitExp = doc.splitTextToSize(turn.evaluation.explanation, contentWidth - 8);
          checkPageBreak(splitExp.length * 3.5 + 4);
          doc.text(splitExp, margin + 4, y);
          y += splitExp.length * 3.5 + 2;
        }
      } else if (q.expectedKeyPoints && q.expectedKeyPoints.length > 0) {
        // When skipped, still provide expected answer keypoints from ebook
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        doc.text("Expected Key Points from BBM PRO 2026 Ebook:", margin + 3, y);
        y += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        const pts = q.expectedKeyPoints.map((p) => `• ${p}`).join("\n");
        const splitPts = doc.splitTextToSize(pts, contentWidth - 8);
        checkPageBreak(splitPts.length * 3.8 + 4);
        doc.text(splitPts, margin + 4, y);
        y += splitPts.length * 3.8 + 3;
      }

      // Divider line between questions
      y += 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    });
  }

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${p} of ${totalPages}  |  Strictly grounded in BBM PRO 2026 Ebook.pdf  |  SBI PO AI Coach`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const fileName = `SBI_PO_Banking_Awareness_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
