
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";

// Always load the latest cleaning quote configuration.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function CleaningQuotePage({
  params,
}: PageProps) {
  const { siteId } = await params;

  let data: Record<string, any> | null = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured");
    }

    const url = new URL(
      "/api/cleaning/quote-gen/get",
      baseUrl
    );

    url.searchParams.set("siteId", siteId);

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error(
        "Cleaning quote fetch failed:",
        res.status,
        res.statusText
      );
    } else {
      const response = await res.json();

      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        data = response;
      }
    }
  } catch (error) {
    console.error("Fetch cleaning quote error:", error);
  }

  // Quote not found or could not be loaded.
  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-4xl">🏠</div>

          <h1 className="text-2xl font-bold text-gray-900">
            Quote Not Available
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            This cleaning quote page could not be found
            or is temporarily unavailable.
          </p>

          <a
            href="https://simplebookme.com"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Visit SimpleBookMe
          </a>
        </div>
      </main>
    );
  }

  // Render the customer-facing quote generator.
  return <CleaningGetQuotePage data={data} />;
}
