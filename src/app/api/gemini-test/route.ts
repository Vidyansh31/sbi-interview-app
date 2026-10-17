
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";



export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
     model: "gemini-3.5-flash-lite",
      contents:
        "You are an SBI PO interview coach. Reply with one short greeting confirming you are ready to conduct a mock interview.",
    });

    return NextResponse.json({
      success: true,
      message: response.text ?? "Gemini returned an empty response.",
    });
  } catch (error) {
    console.error("Gemini test failed:", error);

    return NextResponse.json(
      { error: "Gemini request failed. Check the server terminal for details." },
      { status: 502 }
    );
  }
}
