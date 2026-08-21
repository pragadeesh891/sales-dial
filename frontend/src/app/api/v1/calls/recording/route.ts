import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("recording");
    const callId = String(formData.get("callId") || `call-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "-");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "recording file is required" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const recordingsDirectory = path.join(process.cwd(), "public", "recordings");
    await mkdir(recordingsDirectory, { recursive: true });

    const extension = file.type.includes("mp4") ? "mp4" : "webm";
    const filename = `${callId}-${Date.now()}.${extension}`;
    await writeFile(path.join(recordingsDirectory, filename), bytes);

    return NextResponse.json({
      success: true,
      data: {
        recordingUrl: `/recordings/${filename}`,
        bytes: bytes.length,
        contentType: file.type || "audio/webm"
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to store call recording" }, { status: 500 });
  }
}
