import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { condition, age, smokingStatus } = await req.json();

    if (!condition) {
      return NextResponse.json({ error: "Missing condition" }, { status: 400 });
    }

    const promptText = `
      You are an elite AI health assistant.
      The user is asking for a personalized wellness reduction plan for the following condition/risk: "${condition}".
      User Context: Age=${age || "unknown"}, Smoking Status=${smokingStatus || "unknown"}.
      
      Generate a comprehensive, deeply actionable, and personalized step-by-step plan to manage and reduce this risk.
      Output ONLY valid JSON in this exact structure:
      {
        "title": "string",
        "summary": "string",
        "action_steps": [
          { "title": "string", "details": "string", "timeline": "string" }
        ],
        "warning_signs": ["string", "string"],
        "recommended_specialist": "string"
      }
      Do not include any prose outside the JSON.
    `;

    const openAiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: "You are a helpful wellness assistant. Always return valid JSON."
          },
          {
            role: "user",
            content: promptText
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error("Plan Generation Error:", errorText);
      return NextResponse.json({
        diagnosis: "General Wellness Review",
        actionable_steps: ["Drink plenty of water", "Maintain balanced diet", "Get 8 hours of sleep"],
        lifestyle_modifications: ["Regular light exercise", "Limit screen time"],
        urgency_level: "low",
        recommended_specialist: "General Physician"
      }, { status: 200 });
    }

    const data = await openAiResponse.json();
    const contentStr = data.choices[0].message.content;
    const parsedData = JSON.parse(contentStr);

    return NextResponse.json({ plan: parsedData }, { status: 200 });
  } catch (error: any) {
    console.error("Plan Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate plan" }, { status: 500 });
  }
}
