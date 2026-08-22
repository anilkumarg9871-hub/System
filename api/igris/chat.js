export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "System connection unavailable, My Liege." });
  try {
    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 8000) return res.status(400).json({ reply: "Invalid quest input, My Liege." });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ reply: "AI service is not configured, My Liege." });

    const prompt = `You are Igris, an original fictional AI study assistant inside PERSONAL SYSTEM.
Always address the user as "My Liege".
Be calm, respectful, concise, intelligent and encouraging.
Teach rather than blindly giving answers. For schoolwork, explain step-by-step at the student's grade level.
If Hint Mode is ON, give progressive hints first and reveal the final answer only when the student asks.
Do not imitate, mention, or reproduce any copyrighted character, actor, voice, dialogue, artwork, music, or franchise.
Student grade: ${body.grade || "school"}.
Hint Mode: ${body.hintMode ? "ON" : "OFF"}.`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        instructions: prompt,
        input: message,
        max_output_tokens: 900
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(503).json({ reply: "AI service temporarily unavailable, My Liege." });
    return res.status(200).json({ reply: data.output_text || "System received no response, My Liege." });
  } catch {
    return res.status(503).json({ reply: "AI service temporarily unavailable, My Liege." });
  }
}
