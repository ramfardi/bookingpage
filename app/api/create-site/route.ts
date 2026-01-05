import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabase.server";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export async function POST(req: Request) {
  const site = (await req.json()) as CustomerConfig;

  const { error } = await supabaseServer.from("sites").insert({
    site_id: site.siteId,
	subdomain: site.subdomain,
    data: site,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ siteId: site.siteId });
}
