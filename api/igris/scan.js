export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "System connection unavailable, My Liege." });
  try {
    const { image, grade, hintMode } = req.body || {};
    if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > 7_000_000)
      return res.status(400).json({ reply: "Invalid image, My Liege." });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ reply: "AI service is not configured, My Liege." });

    const instructions = `You are Igris, an original school study assistant. Address the student as My Liege.
Analyze the supplied question image. First transcribe the question clearly. Then identify the subject and explain what is being asked. Solve step-by-step at ${grade || "school"} level. ${hintMode ? "Hint Mode is ON: give progressive hints before the final answer." : "Give the final answer after the explanation."} Be concise and educational. Do not imitate copyrighted characters or voices.`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        instructions,
        input: [{ role:"user", content:[
          { type:"input_text", text:"Analyze this question image." },
          { type:"input_image", image_url:image }
        ]}],
        max_output_tokens: 1200
      })
    });
    const data=await r.json();
    if(!r.ok) return res.status(503).json({reply:"Vision service temporarily unavailable, My Liege."});
    res.json({reply:data.output_text || "I could not read the question, My Liege."});
  } catch {
    res.status(503).json({reply:"Vision service temporarily unavailable, My Liege."});
  }
}
