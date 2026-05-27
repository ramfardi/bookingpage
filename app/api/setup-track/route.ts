import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = getSupabase();

  await supabase.from("setup_events").insert({
    session_id: body.sessionId,
    step: body.step,
    template_id: body.templateId,
  });

  return NextResponse.json({ ok: true });
}