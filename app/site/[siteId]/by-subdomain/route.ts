import { getSupabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  const subdomain = new URL(req.url).searchParams.get("subdomain");

  if (!subdomain) {
    return new Response("Missing subdomain", { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("sites")
    .select("data")
    .eq("subdomain", subdomain)
    .single();

  if (error || !data) {
    return new Response("Site not found", { status: 404 });
  }

  return Response.json(data.data);
}
