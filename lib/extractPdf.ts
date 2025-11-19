import pdf from "pdf-parse-fixed";

export async function extractPdfText(buffer: Buffer) {
  const data = await pdf(buffer);
  return data.text;
}
