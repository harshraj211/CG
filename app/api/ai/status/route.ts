import { NextResponse } from "next/server";
import { groqConfigured, groqModel } from "@/services/groq";
export async function GET() {
  return NextResponse.json(
    {
      configured: groqConfigured(),
      provider: "Groq",
      model: groqModel(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
