import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const profile = form.get("profile") as string | null;
    const fileName = form.get("fileName") as string | null;

    if (!file || !profile || !fileName) {
      return Response.json(
        { error: "Missing file, profile or fileName" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: `docs/${profile.trim()}`,
            public_id: fileName,
          },
          (err, res) => (err ? reject(err) : resolve(res))
        )
        .end(buffer);
    });

    return Response.json({ url: result.secure_url });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
