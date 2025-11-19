import { embedText } from "@/serverFunction/jina";
import { index } from "@/lib/pinecone";

export async function POST(req: Request) {
  try {
    const { text, profileName, fileName } = await req.json();

    const vector = await embedText(text);

    const results = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
      filter: { profile: profileName, file: fileName },
    });

    const context = results.matches
      .map((m) => (m.metadata?.text as string) ?? "")
      .filter(Boolean)
      .join("\n\n---\n\n");

    return Response.json({ context });
  } catch (err) {
    console.error("RAG ERROR:", err);
    return Response.json({ error: "RAG failed" }, { status: 500 });
  }
}
