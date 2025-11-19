import { index } from "@/lib/pinecone";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const { profileName, fileName } = await req.json();

    const matches = await index.query({
      vector: Array(768).fill(0),
      topK: 500,
      includeMetadata: true,
      filter: {
        profile: profileName,
        file: fileName,
      },
    });

    const ids = matches.matches.map((m) => m.id);
    await index.deleteMany(ids);

    await cloudinary.api.delete_resources_by_prefix(
      `docs/${profileName}/${fileName}`,
      { resource_type: "raw" }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
