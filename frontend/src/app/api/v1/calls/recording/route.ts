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
    const extension = file.type.includes("mp4") ? "mp4" : "webm";
    const filename = `${callId}-${Date.now()}.${extension}`;
    let recordingUrl = `/recordings/${filename}`;

    try {
      const recordingsDirectory = path.join(process.cwd(), "public", "recordings");
      await mkdir(recordingsDirectory, { recursive: true });
      await writeFile(path.join(recordingsDirectory, filename), bytes);
    } catch {
      // In serverless environments (Netlify / Vercel), fallback to data URI if disk is read-only
      recordingUrl = `data:${file.type || "audio/webm"};base64,${bytes.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        recordingUrl,
        bytes: bytes.length,
        contentType: file.type || "audio/webm"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to store call recording" }, { status: 500 });
  }
}

