import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";

// 🔥 REQUIRED for dynamic data
export const dynamic = "force-dynamic";

export default async function CleaningQuotePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  let data = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/cleaning/quote-gen/get?siteId=${siteId}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.error("Fetch quote error:", err);
  }

  if (!data) {
    return <div className="p-10 text-center">Quote not found</div>;
  }

  return <CleaningGetQuotePage data={data} />;
}