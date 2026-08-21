import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const { leadId, subject, body } = await request.json();
    const lead = mockDb.leads.find((item) => item.id === leadId);

    if (!lead?.email) {
      return NextResponse.json({ success: false, error: "This lead has no email address" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      return NextResponse.json({
        success: false,
        error: "Email sending is not configured. Set RESEND_API_KEY and EMAIL_FROM in frontend/.env.local."
      }, { status: 503 });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [lead.email],
        subject,
        text: body
      })
    });

    const resendData = await resendResponse.json();
    if (!resendResponse.ok) {
      return NextResponse.json({ success: false, error: resendData?.message || "Email provider rejected the message" }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: { recipient: lead.email, providerId: resendData.id } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
