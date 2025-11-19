"use server";

import axios from "axios";

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";
const JINA_MODEL = "jina-embeddings-v2-base-en";

export interface EmbeddedChunk {
  id: number;
  text: string;
  embedding: number[];
}

function getKey(): string {
  const key = process.env.JINA_API_KEY;
  if (!key) throw new Error("Missing JINA_API_KEY");
  return key;
}

export async function embedText(text: string): Promise<number[]> {
  const cleaned = text.trim();
  if (!cleaned) throw new Error("Empty text for embedding.");

  const res = await axios.post(
    JINA_API_URL,
    { input: cleaned, model: JINA_MODEL },
    {
      headers: {
        Authorization: `Bearer ${getKey()}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data[0].embedding as number[];
}

export async function embedChunksConcurrent(chunks: string[]): Promise<EmbeddedChunk[]> {
  const CONCURRENCY = 20;
  const results: EmbeddedChunk[] = [];
  let index = 0;

  while (index < chunks.length) {
    const slice = chunks.slice(index, index + CONCURRENCY);

    const batch: EmbeddedChunk[] = await Promise.all(
      slice.map(async (text, i) => {
        const cleaned = text.trim();

        const res = await axios.post(
          JINA_API_URL,
          { input: cleaned, model: JINA_MODEL },
          {
            headers: {
              Authorization: `Bearer ${getKey()}`,
              "Content-Type": "application/json",
            },
          }
        );

        return {
          id: index + i,
          text: cleaned,
          embedding: res.data.data[0].embedding as number[],
        };
      })
    );

    results.push(...batch);
    index += CONCURRENCY;
  }

  return results;
}
