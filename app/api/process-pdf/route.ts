export const runtime = "nodejs";


import { getTextFromPdf } from "@/serverFunction/getTextFromPdf";

export async function POST(req: Request) {
  try {
    const { url, fileName, profileName } = await req.json();

    if (!url || !fileName || !profileName) {
      return Response.json(
        { error: "Missing url, fileName or profileName" },
        { status: 400 }
      );
    }

    const msg = await getTextFromPdf(url, fileName, profileName);

    return Response.json({ status: "done", message: msg });
  } catch (err) {
    console.error("PROCESS PDF ERROR:", err);
    return Response.json(
      { status: "error", message: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
