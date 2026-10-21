import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript, localTime } = await req.json();

    const systemPrompt = `You are an alarm time extractor. 
    The current real-world local time is ${localTime}. 
    The user is going to say when they want an alarm to ring. 
    Your ONLY job is to figure out what time they mean and output it in strict 24-hour HH:MM format (e.g. 15:30). 
    Do NOT output ANY other text. Do NOT explain your reasoning. Just the HH:MM string.
    If the user says 'in 5 minutes', add 5 minutes to ${localTime}. 
    If the user says 'at 3 pm', output 15:00.
    If they say something completely unrelated to time, just output '12:00'.`;

    let parsedTime = "";
    try {
      const openAiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: transcript }
          ],
          temperature: 0.1,
          max_completion_tokens: 300
        })
      });

      if (openAiResponse.ok) {
        const data = await openAiResponse.json();
        parsedTime = data.choices?.[0]?.message?.content?.trim() || "";
      }
    } catch (e) {
      console.error("Time Parse Fetch Error:", e);
    }

    // Basic validation to ensure it's HH:MM
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (parsedTime && timeRegex.test(parsedTime)) {
        return NextResponse.json({ time: parsedTime }, { status: 200 });
    } else {
        // Fallback to exactly 5 minutes from current time
        const [hh, mm] = (localTime || "12:00").split(":").map(Number);
        const d = new Date();
        d.setHours(isNaN(hh) ? 12 : hh);
        d.setMinutes((isNaN(mm) ? 0 : mm) + 5);
        const fallback = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return NextResponse.json({ time: fallback }, { status: 200 });
    }

  } catch (error: any) {
    console.error("Time Parse Error:", error);
    return NextResponse.json({ time: "12:00" }, { status: 200 });
  }
}
