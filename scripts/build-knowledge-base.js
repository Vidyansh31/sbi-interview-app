const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractChapters() {
  console.log('Extracting text from BBM_PRO_2026 Ebook.pdf...');
  const pdfPath = path.resolve('public/BBM_PRO_2026 Ebook.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse(new Uint8Array(buffer));
  const res = await parser.getText();
  
  const fullText = res.text;
  console.log('Extracted characters:', fullText.length);
  console.log('Total pages in metadata:', res.total || res.pages?.length);

  // Split into chunks of ~3000-4000 characters with overlap to preserve conceptual coherence
  // Each chunk represents a discrete verifiable knowledge unit
  const chunkSize = 3500;
  const overlap = 300;
  const chunks = [];
  
  let currentPos = 0;
  let chunkIndex = 0;

  while (currentPos < fullText.length) {
    let endPos = Math.min(currentPos + chunkSize, fullText.length);
    // Find next newline or sentence end to avoid chopping mid-word
    if (endPos < fullText.length) {
      const nextNewline = fullText.indexOf('\n', endPos);
      if (nextNewline !== -1 && nextNewline - endPos < 200) {
        endPos = nextNewline;
      }
    }

    const chunkContent = fullText.slice(currentPos, endPos).trim();
    if (chunkContent.length > 200) {
      // Deduce a probable topic/heading from the first lines of the chunk
      const lines = chunkContent.split('\n').map(l => l.trim()).filter(Boolean);
      let guessedTitle = 'Banking Concept';
      for (const line of lines.slice(0, 5)) {
        if (line.length > 4 && line.length < 60 && !line.includes('Page') && !line.includes('Follow us')) {
          guessedTitle = line;
          break;
        }
      }

      chunks.push({
        id: `chunk-${chunkIndex + 1}`,
        chunkIndex: chunkIndex + 1,
        approxPage: Math.floor((currentPos / fullText.length) * (res.total || 356)) + 1,
        title: guessedTitle,
        content: chunkContent
      });
      chunkIndex++;
    }

    currentPos = endPos - overlap;
    if (endPos >= fullText.length) break;
  }

  console.log(`Generated ${chunks.length} structured knowledge chunks.`);

  // Save to src/data/bankingAwarenessKnowledge.json
  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'bankingAwarenessKnowledge.json');
  fs.writeFileSync(outFile, JSON.stringify(chunks, null, 2), 'utf8');
  console.log('Saved knowledge base to:', outFile);
}

extractChapters().catch(console.error);
