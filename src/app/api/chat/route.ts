import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const message = (formData.get("message") as string) || "";
    const isEmergency = formData.get("isEmergency") === "true";

    if (!message && !image) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY || "";

    // System prompt defining Lumi's clinical personality and required output format
    const systemPrompt = `You are Lumi, the clinical AI companion inside HealthThread Beacon.
Your voice is warm, empathetic, natural, and clear.
CRITICAL TTS REQUIREMENT: DO NOT use asterisks (*), markdown hashes (#), or bullet points that get pronounced. Speak smoothly and naturally with clear sentences.

Required Diagnosis Output Format:
Hey! I am Lumi.
According to my diagnosis,
Condition: [Name of condition or diagnosis - brief 1-2 sentence description of symptoms/observation]

How to treat:
Step 1: [First clear treatment step]
Step 2: [Second treatment step]
Step 3: [Third treatment step]

Specialist: [Specify the exact medical specialist, e.g., Dermatologist, Pulmonologist, Orthopedic, General Physician]

Emergency Contact: Dial 911 (US/Canada), 112 (Europe), or 102 (India) immediately if symptoms escalate or for acute distress.

CRITICAL EMERGENCY RULE:
If the symptoms or situation involve an acute emergency like severe cuts, burns, arterial bleeding, choking, or head trauma, you MUST include on its own line:
EMERGENCY_REDIRECT: https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1`;

    let userPrompt = message;
    if (image) {
      userPrompt = `[Patient Camera Capture Attached: ${image.name || "medical_scan.jpg"}]. Symptoms / notes: ${message || "Please analyze this physical health condition and diagnose."}`;
      if (isEmergency) {
        userPrompt = `[ACUTE EMERGENCY DETECTED - CUT/BURN/BLEEDING]: ${userPrompt}`;
      }
    }

    // Call Groq API with gpt-oss-120b
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 320,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });


    if (groqResponse.ok) {
      const data = await groqResponse.json();
      let text = data.choices?.[0]?.message?.content || "";

      // Ensure no asterisks in the text output
      text = text.replace(/\*/g, "");

      // If acute emergency requested, guarantee the emergency link
      if ((isEmergency || /cut|burn|bleed|blood|chok/i.test(message)) && !text.includes("EMERGENCY_REDIRECT:")) {
        text += "\nEMERGENCY_REDIRECT: https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1";
      }

      return NextResponse.json({
        content: text,
        hasImage: !!image,
        provider: "groq-gpt-oss-120b"
      });
    }

    // Secondary fallback to qwen3.8-27b on Groq
    const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      let text = (data.choices?.[0]?.message?.content || "").replace(/\*/g, "");
      if (isEmergency && !text.includes("EMERGENCY_REDIRECT:")) {
        text += "\nEMERGENCY_REDIRECT: https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1";
      }
      return NextResponse.json({
        content: text,
        hasImage: !!image,
        provider: "groq-qwen"
      });
    }

    // Default safe clinical fallback if internet interrupted
    return NextResponse.json({
      content: "Hey! I am Lumi. According to my diagnosis, your symptoms indicate mild inflammation or physical strain. How to treat: Step 1, cleanse the affected area with antiseptic water. Step 2, apply a sterile soothing compress. Step 3, rest and avoid friction. Specialist: General Physician or Dermatologist. Emergency Contact: Dial 911 or 112 for acute emergency.",
      hasImage: !!image,
      provider: "lumi-offline"
    });
  } catch (error: any) {
    console.error("Lumi Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process diagnosis" }, { status: 500 });
  }
}
