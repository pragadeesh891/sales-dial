import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let rawLeads: any[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided in request" }, { status: 400 });
      }

      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

      // Simple CSV parser
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        if (values.length >= 2) {
          rawLeads.push({
            customerName: values[headers.indexOf("name")] || values[0] || "Customer",
            phone: values[headers.indexOf("phone")] || values[1] || "+91 99999 00000",
            email: values[headers.indexOf("email")] || values[2] || "",
            company: values[headers.indexOf("company")] || values[3] || "Corporate Client",
            location: values[headers.indexOf("location")] || values[4] || "Mumbai",
            product: values[headers.indexOf("product")] || values[5] || "CRM Suite",
            source: values[headers.indexOf("source")] || "Excel Upload"
          });
        }
      }
    } else {
      // JSON payload or simulated sample upload
      const body = await request.json().catch(() => ({}));
      if (Array.isArray(body.leads) && body.leads.length > 0) {
        rawLeads = body.leads;
      } else {
        // Generate simulated sample 100 leads for quick demo mode
        const sampleCompanies = ["Reliance Tech", "Tata Consulting", "Infosys Partner", "Mahindra Digital", "Zomato Sales", "Swiggy B2B", "HDFC Direct", "ICICI Enterprise", "Paytm Merchant", "Flipkart Logistics"];
        const sampleLocations = ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Ahmedabad", "Kolkata"];
        const sampleProducts = ["AI Sales Intelligence", "Enterprise Softphone Dialer", "Call Quality Analyzer", "Callyzer CRM Engine"];
        const sampleSources = ["Website Demo Request", "LinkedIn Outbound", "Cold Email Campaign", "Trade Show Leads", "Excel Upload Batch #100"];

        for (let i = 1; i <= 100; i++) {
          const company = sampleCompanies[i % sampleCompanies.length];
          const location = sampleLocations[i % sampleLocations.length];
          const product = sampleProducts[i % sampleProducts.length];
          const source = sampleSources[i % sampleSources.length];

          rawLeads.push({
            customerName: `Customer #${1000 + i}`,
            phone: `+91 ${Math.floor(90000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`,
            email: `client${i}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
            company: company,
            location: location,
            product: product,
            source: source
          });
        }
      }
    }

    const processedLeads = [];
    let hotCount = 0;
    let warmCount = 0;
    let coldCount = 0;

    for (const item of rawLeads) {
      const { score, label } = mockDb.calculateLeadScore({
        company: item.company,
        source: item.source,
        location: item.location
      });

      if (label === "hot") hotCount++;
      else if (label === "warm") warmCount++;
      else coldCount++;

      const newLead = {
        id: `lead-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        leadCode: `LD-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: item.customerName || "Sales Prospect",
        phone: item.phone,
        email: item.email || "",
        company: item.company || "Enterprise Client",
        location: item.location || "India",
        product: item.product || "Dialer & CRM",
        source: item.source || "Excel File Upload",
        status: "new" as const,
        priorityScore: score,
        priorityLabel: label,
        createdAt: new Date().toISOString()
      };

      mockDb.leads.unshift(newLead);
      processedLeads.push(newLead);
    }

    mockDb.saveLeads();

    return NextResponse.json({
      success: true,
      message: `Successfully processed and validated ${processedLeads.length} leads.`,
      summary: {
        totalUploaded: processedLeads.length,
        hotLeads: hotCount,
        warmLeads: warmCount,
        coldLeads: coldCount
      },
      data: processedLeads.slice(0, 10) // return first 10 for quick preview
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to process lead upload" }, { status: 500 });
  }
}
