import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Clean text strictly: no asterisks, no hashes, no markdown brackets or raw emojis that disrupt speech
    const cleanSpokenText = text
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/[_~`]/g, "")
      .replace(/EMERGENCY_REDIRECT:[^\n]+/gi, "")
      .trim();

    const apiKey = process.env.DEEPGRAM_API_KEY || "";

    const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: cleanSpokenText })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Deepgram TTS Error: ${errorText}`);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      }
    });
  } catch (error: any) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate audio" }, { status: 500 });
  }
}
