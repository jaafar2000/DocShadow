import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { index } from "@/lib/pinecone";
import { embedChunksConcurrent } from "./jina";
import { extractPdfText } from "@/lib/extractPdf";

function cleanText(input: string) {
  return input
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/–/g, "-")
    .replace(/•/g, "-")
    .trim();
}

export async function getTextFromPdf(
  pdfUrl: string,
  fileName: string,
  profileName: string
) {
  const res = await fetch(pdfUrl);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const rawText = await extractPdfText(buffer);
  const cleaned = cleanText(rawText);

  const length = cleaned.length;
  const chunkSize = Math.min(1800, Math.max(500, Math.floor(length / 25)));
  const overlap = Math.floor(chunkSize * 0.12);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: overlap,
  });

  const chunks = await splitter.splitText(cleaned);

  const embedded = await embedChunksConcurrent(chunks);

  const vectors = embedded.map((item) => ({
    id: `${profileName}_${fileName}_${item.id}`,
    values: item.embedding,
    metadata: {
      text: item.text,
      file: fileName,
      profile: profileName,
    },
  }));

  await index.upsert(vectors);

  return `DONE — ${chunks.length} chunks saved (chunkSize=${chunkSize}, overlap=${overlap})`;
}
