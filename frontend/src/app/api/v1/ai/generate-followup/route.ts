import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, customPrompt } = body;

    const lead = mockDb.leads.find(l => l.id === leadId) || mockDb.leads[0];

    const customerName = lead.customerName;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const email = lead.email || "client@company.com";
    const company = lead.company || "Enterprise Partner";

    // AI Core 3 Message Crafting
    const whatsappText = `Hi ${customerName}! Thank you for taking our live voice call regarding ${lead.product} for ${company}. As discussed, here is your customized proposal & demo link: https://callyzer-ai.com/demo/${lead.leadCode}. Let us connect tomorrow at 10 AM!`;

    const emailSubject = `Follow-up: Customized Proposal for ${company} - ${lead.product}`;
    const emailBody = `Hi ${customerName},\n\nThank you for connecting on our live call today. It was great discussing your team's sales cold calling goals at ${company}.\n\nAs promised, here is the executive summary and proposal link for ${lead.product}:\nhttps://callyzer-ai.com/demo/${lead.leadCode}\n\nKey Highlights Discussed:\n1. 100% Real-Time Call Transparency & Audio Recording\n2. AI Live Objection Battlecards & Quality Scoring (0-100)\n3. Automated CRM Lead Status Updates & Smart Follow-ups\n\nPlease let me know if 10:00 AM tomorrow works for our follow-up demo.\n\nBest regards,\nPriya Sharma\nSales Intelligence Team`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsappText)}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return NextResponse.json({
      success: true,
      data: {
        leadId: lead.id,
        customerName,
        phone: lead.phone,
        email,
        whatsappText,
        whatsappUrl,
        emailSubject,
        emailBody,
        mailtoUrl
      },
      message: "✅ AI Core 3: WhatsApp & Email follow-up templates generated!"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to generate follow-up templates" }, { status: 500 });
  }
}
