const fs = require('fs');
const path = require('path');
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function benchConcise() {
  const rawKnowledge = require('../src/data/bankingAwarenessKnowledge.json');
  const chunk = rawKnowledge[25];

  console.log('Testing with concise context (1200 chars)...');
  let t0 = Date.now();
  let resp = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: `Based SOLELY on this excerpt from BBM PRO 2026 Ebook, generate 1 SBI PO interview question in JSON.
Excerpt:
${chunk.content.slice(0, 1200)}

Format:
{"topic": "...", "question": "...", "hint": "..."}`,
    config: {
      responseMimeType: 'application/json',
    }
  });
  console.log('Took with thinkingBudget: 0 ->', (Date.now() - t0) / 1000, 's');
  console.log(resp.text);
}

benchConcise().catch(console.error);
