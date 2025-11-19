import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return Response.json({ normalized: "" }, { status: 400 });
    }

    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Rewrite the user input with correct spelling and grammar. Output ONLY the corrected sentence.",
        },
        { role: "user", content: text },
      ],
    });

    const normalized =
      result.choices?.[0]?.message?.content?.trim() || text;

    return Response.json({ normalized });
  } catch (err) {
    console.error("Normalization Error:", err);
    return Response.json({ normalized: "" }, { status: 500 });
  }
}
