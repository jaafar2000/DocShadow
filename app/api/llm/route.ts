import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { text, context } = await req.json();
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        {
          role: "system",
          content: `
If user asks about the PDF → answer ONLY using context.
If answer not in context → reply exactly: "Not found in the provided document."
If message is general → answer normally.
`,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${text}`,
        },
      ],
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const token = chunk.choices?.[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "LLM failed" }, { status: 500 });
  }
}
