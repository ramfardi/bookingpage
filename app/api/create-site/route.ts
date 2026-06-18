import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabase.server";
import type { CustomerConfig } from "@/app/lib/customerConfig";

function sanitizeSubdomain(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .slice(0, 25);
}

export async function POST(req: Request) {
  try {
const site = (await req.json()) as CustomerConfig;

	if (!site.siteId || !site.subdomain) {
	  return NextResponse.json(
		{ error: "Missing siteId or subdomain" },
		{ status: 400 }
	  );
	}

	// sanitize
	site.subdomain = sanitizeSubdomain(site.subdomain);

	// validate
	if (
	  site.subdomain.length < 3 ||
	  !/^[a-z0-9-]+$/.test(site.subdomain)
	) {
	  return NextResponse.json(
		{
		  error:
			"Subdomain must contain only letters, numbers and hyphens (3-25 characters).",
		},
		{ status: 400 }
	  );
	}

    const { error } = await supabaseServer.from("sites").insert({
      site_id: site.siteId,
      subdomain: site.subdomain,
      data: site,
    });

    if (error) {
      /**
       * Supabase / Postgres unique constraint error
       * code: 23505 = unique_violation
       */
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate")
      ) {
        return NextResponse.json(
          {
            error: "Subdomain already exists",
          },
          { status: 409 }
        );
      }

      console.error("Create site error:", error);

      return NextResponse.json(
        { error: "Failed to create site" },
        { status: 500 }
      );
    }

    return NextResponse.json({ siteId: site.siteId });
  } catch (err) {
    console.error("Create site exception:", err);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
