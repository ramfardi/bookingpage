"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HomePage from "@/components/HomePage";
import type { CustomerConfig, ScheduleDay } from "@/app/lib/customerConfig";
import { supabaseBrowser } from "@/app/lib/supabase-browser";
import imageCompression from "browser-image-compression";
import { generateSeo } from "@/app/lib/generateSeo";


export default function SitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const pathname = usePathname();
  const isEditor = pathname.startsWith("/site/");

  const [siteId, setSiteId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [beforeImage, setBeforeImage] = useState<string | null>(null);

	const [afterImage, setAfterImage] = useState<string | null>(null);

	const [beforeAfterMode, setBeforeAfterMode] = useState<
	  "story" | "square" | "slider"
	>("story");
	
	const [scheduleOpen, setScheduleOpen] = useState(false);

  /* ---------------- RESOLVE PARAMS ---------------- */
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setSiteId(resolved.siteId);
    }
    resolveParams();
  }, [params]);

  /* ---------------- LOAD SITE DATA ---------------- */
  useEffect(() => {
    if (!siteId) return;

    async function load() {
      const res = await fetch(`/api/site/${siteId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    }

    load();
  }, [siteId]);

  /* ---------------- NORMALIZE PRICING ---------------- */
  const normalizedItems =
    customer?.pricing?.items?.length
      ? customer.pricing.items
      : customer?.pricing?.rows?.length
      ? customer.pricing.rows.map((row: any) => ({
          label: row?.name || "",
          description: row?.includes || "",
          price: row?.price || "",
        }))
      : customer?.services?.length
      ? customer.services.map((service: string) => ({
          label: service,
          description: "",
          price: "",
        }))
      : [];

  /* ---------------- ENSURE ITEMS EXIST ---------------- */
  useEffect(() => {
    if (!customer) return;

    if (customer.pricing?.items?.length) return;

    if (normalizedItems.length === 0) return;

    setCustomer((prev) => ({
      ...prev!,
      pricing: {
        ...prev!.pricing,
        items: normalizedItems,
      },
    }));
  }, [customer]);

  if (!customer) {
    return <div className="p-10">Loading editor…</div>;
  }

  /* ---------------- SAVE ---------------- */
  
async function uploadGalleryImage(file: File) {
  try {
    setUploading(true);

    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const fileToUpload = isVideo
      ? file
      : await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
        });

    const { error } = await supabaseBrowser.storage
      .from("gallery")
      .upload(fileName, fileToUpload);

    if (error) {
      console.error(error);
      alert("Upload failed");
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("gallery")
      .getPublicUrl(fileName);

    setCustomer((prev) => ({
      ...prev!,
      about: {
        ...prev!.about,
        gallery: [
          ...(prev!.about.gallery || []),
          data.publicUrl,
        ],
      },
    }));
  } finally {
    setUploading(false);
  }
}

async function uploadLogoImage(file: File) {
  try {
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `logos/${crypto.randomUUID()}.${ext}`;

    const compressedLogo = await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 800,
    });

    const { error } = await supabaseBrowser.storage
      .from("gallery")
      .upload(fileName, compressedLogo, {
        upsert: true,
      });

    if (error) {
      console.error(error);
      alert("Logo upload failed");
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("gallery")
      .getPublicUrl(fileName);

    setCustomer((prev) => ({
      ...prev!,
      branding: {
        ...(prev!.branding || {}),
        logoUrl: data.publicUrl,
        showLogoInHero: prev!.branding?.showLogoInHero ?? true,
        servingCity: prev!.branding?.servingCity || "",
      },
    }));
  } finally {
    setUploading(false);
  }
}
  
async function saveChanges() {
  if (!siteId || !customer) return;

  setSaving(true);

  const cleanedItems = normalizedItems.filter(
    (item: any) => item.label?.trim()
  );

  const updatedCustomer = {
    ...customer,

    services: cleanedItems.map((item: any) => item.label),

    pricing: {
      ...customer.pricing,
      title: customer.pricing?.title || "Pricing",

      items: cleanedItems.map((item: any) => ({
        label: item.label,
        description: item.description || "",
        price: item.price || "",
      })),

      rows: cleanedItems.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.label,
        price: item.price || "",
        includes: item.description || "",
      })),
    },
  };
  
  updatedCustomer.seo = generateSeo(updatedCustomer);

  const res = await fetch(`/api/site/${siteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: updatedCustomer,
    }),
  });

  setSaving(false);

  if (!res.ok) {
    const text = await res.text();
    console.error("Save failed:", text);
    alert("Save failed. Please try again.");
    return;
  }

  setCustomer(updatedCustomer);
  alert("Changes saved");
}



function handleImageDragStart(
  e: React.DragEvent,
  imageUrl: string
) {
  e.dataTransfer.setData("imageUrl", imageUrl);
}

function handleBeforeAfterDrop(
  e: React.DragEvent,
  type: "before" | "after"
) {
  e.preventDefault();

  const imageUrl = e.dataTransfer.getData("imageUrl");

  if (!imageUrl) return;

  if (type === "before") setBeforeImage(imageUrl);

  if (type === "after") setAfterImage(imageUrl);
}



function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imgRatio = img.width / img.height;
  const boxRatio = width / height;

  let sourceWidth = img.width;
  let sourceHeight = img.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imgRatio > boxRatio) {
    sourceWidth = img.height * boxRatio;
    sourceX = (img.width - sourceWidth) / 2;
  } else {
    sourceHeight = img.width / boxRatio;
    sourceY = (img.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
}

async function downloadBeforeAfterImage() {
  if (!beforeImage || !afterImage) return;

  const canvas = document.createElement("canvas");

  if (beforeAfterMode === "story") {
    canvas.width = 1080;
    canvas.height = 1920;
  } else {
    canvas.width = 1080;
    canvas.height = 1080;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const before = new Image();
  const after = new Image();

  before.crossOrigin = "anonymous";
  after.crossOrigin = "anonymous";

  before.onload = () => {
    after.onload = () => {
      const halfWidth = canvas.width / 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawImageCover(ctx, before, 0, 0, halfWidth, canvas.height);

      drawImageCover(ctx, after, halfWidth, 0, halfWidth, canvas.height);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, 90);

      ctx.fillStyle = "white";
      ctx.font = "bold 42px Arial";

      ctx.fillText("BEFORE", 130, 60);
      ctx.fillText("AFTER", halfWidth + 160, 60);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");

      link.download =
        beforeAfterMode === "story"
          ? "before-after-story.png"
          : "before-after-square.png";

      link.click();
    };

    after.src = afterImage;
  };

  before.src = beforeImage;
}

function saveSliderToPortfolio() {
  if (!beforeImage || !afterImage) return;

  setCustomer((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      beforeAfter: [
        ...(prev.beforeAfter || []),
        {
          id: crypto.randomUUID(),
          type: "slider",
          beforeImage,
          afterImage,
        },
      ],
    };
  });

  alert("Slider added. Click Save changes to publish.");
}



  return (
    <div className="flex h-screen">
      {/* ================= LEFT: EDITOR ================= */}
      {isEditor && (
        <aside className="w-[42rem] border-r bg-gray-50 p-6 overflow-y-auto shrink-0">
		<div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-6 flex items-center justify-between">
		  <h2 className="text-lg font-semibold">
			Edit your website
		  </h2>

		  <button
			onClick={saveChanges}
			disabled={saving}
			className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium shadow-sm disabled:opacity-60"
		  >
			{saving ? "Saving…" : "Save changes"}
		  </button>
		</div>

{/* -------- BRANDING -------- */}
<section className="mb-8 rounded-2xl border bg-white p-4">
  <h3 className="font-medium mb-3">Branding</h3>

  <p className="text-sm text-gray-500 mb-4">
    Upload your business logo and add a service area such as “Serving North Vancouver”.
  </p>

  <div className="mb-5">
    <label className="block text-sm text-gray-600 mb-2">
      Business logo
    </label>

    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          await uploadLogoImage(file);
        }
      }}
      className="block w-full text-sm text-gray-600
      file:mr-4 file:rounded-xl file:border-0
      file:bg-indigo-600 file:px-4 file:py-2
      file:text-white hover:file:bg-indigo-700"
    />

    {customer.branding?.logoUrl && (
      <div className="mt-4 rounded-xl border bg-gray-50 p-4">
        <img
          src={customer.branding.logoUrl}
          alt="Business logo preview"
          className="h-20 max-w-[220px] object-contain bg-white rounded-lg p-2 border"
        />

        <button
          type="button"
          className="mt-3 text-sm text-red-600"
          onClick={() =>
            setCustomer({
              ...customer,
              branding: {
                ...(customer.branding || {}),
                logoUrl: "",
              },
            })
          }
        >
          Remove logo
        </button>
      </div>
    )}
  </div>

  <div className="mb-5">
    <label className="block text-sm text-gray-600 mb-1">
      Serving city / area
    </label>

    <input
      className="w-full border rounded-md p-2"
      placeholder="North Vancouver"
      value={customer.branding?.servingCity || ""}
      onChange={(e) =>
        setCustomer({
          ...customer,
          branding: {
            ...(customer.branding || {}),
            servingCity: e.target.value,
            showLogoInHero:
              customer.branding?.showLogoInHero ?? true,
          },
        })
      }
    />

    <p className="mt-1 text-xs text-gray-500">
      Example: Serving North Vancouver
    </p>
  </div>

  <label className="flex items-center gap-2 text-sm text-gray-700">
    <input
      type="checkbox"
      checked={customer.branding?.showLogoInHero ?? true}
      onChange={(e) =>
        setCustomer({
          ...customer,
          branding: {
            ...(customer.branding || {}),
            showLogoInHero: e.target.checked,
            servingCity: customer.branding?.servingCity || "",
          },
        })
      }
    />
    Show logo above homepage title
  </label>
</section>


          {/* -------- HERO -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">Hero</h3>

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="Main headline"
              value={customer.landing.header1}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    header1: e.target.value,
                  },
                })
              }
            />

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="Second headline"
              value={customer.landing.header2}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    header2: e.target.value,
                  },
                })
              }
            />

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="Subheader line 1"
              value={customer.landing.subheader1}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    subheader1: e.target.value,
                  },
                })
              }
            />

            <input
              className="w-full border rounded-md p-2"
              placeholder="Subheader line 2"
              value={customer.landing.subheader2}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    subheader2: e.target.value,
                  },
                })
              }
            />
          </section>

          {/* -------- SERVICES & PRICING -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">Services & Pricing</h3>

            {normalizedItems.map((item: any, index: number) => (
              <div
                key={index}
                className="border rounded-md p-3 mb-3 space-y-2"
              >
                {/* Service name */}
                <input
                  className="w-full border rounded-md p-2"
                  placeholder="Service name"
                  value={item.label ?? ""}
                  onChange={(e) => {
                    const items = [...normalizedItems];
                    items[index] = {
                      ...items[index],
                      label: e.target.value,
                    };

                    setCustomer({
                      ...customer,
                      pricing: {
                        ...customer.pricing,
                        items,
                      },
                    });
                  }}
                />

                {/* Description */}
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  rows={2}
                  placeholder="Service description"
                  value={item.description ?? ""}
                  onChange={(e) => {
                    const items = [...normalizedItems];
                    items[index] = {
                      ...items[index],
                      description: e.target.value,
                    };

                    setCustomer({
                      ...customer,
                      pricing: {
                        ...customer.pricing,
                        items,
                      },
                    });
                  }}
                />

                {/* Price + Remove */}
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1 border rounded-md p-2"
                    placeholder="Price (e.g. $50)"
                    value={item.price ?? ""}
                    onChange={(e) => {
                      const items = [...normalizedItems];
                      items[index] = {
                        ...items[index],
                        price: e.target.value,
                      };

                      setCustomer({
                        ...customer,
                        pricing: {
                          ...customer.pricing,
                          items,
                        },
                      });
                    }}
                  />

                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 px-2"
                    onClick={() => {
                      if (!confirm("Remove this service?")) return;

                      const items = [...normalizedItems];
                      items.splice(index, 1);

                      setCustomer({
                        ...customer,
                        pricing: {
                          ...customer.pricing,
                          items,
                        },
                      });
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="text-sm text-indigo-600 font-medium"
              onClick={() =>
                setCustomer({
                  ...customer,
                  pricing: {
                    ...customer.pricing,
                    items: [
                      ...normalizedItems,
                      {
                        label: "New service",
                        description: "",
                        price: "",
                      },
                    ],
                  },
                })
              }
            >
              + Add service
            </button>
          </section>

          {/* -------- ABOUT -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">About</h3>

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="About title"
              value={customer.about.title}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  about: {
                    ...customer.about,
                    title: e.target.value,
                  },
                })
              }
            />

            <textarea
              className="w-full border rounded-md p-2 mb-2"
              rows={4}
              placeholder="About description"
              value={customer.about.description}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  about: {
                    ...customer.about,
                    description: e.target.value,
                  },
                })
              }
            />
			
			<div className="mt-4 space-y-3">
  <h4 className="text-sm font-medium text-gray-700">
    Bullet points
  </h4>

  {(customer.about.highlights || []).map((highlight, index) => (
    <div key={index} className="flex gap-2">
      <input
        className="flex-1 border rounded-md p-2 text-sm"
        placeholder="Example: 10+ years experience"
        value={highlight}
        onChange={(e) => {
          const updated = [...(customer.about.highlights || [])];
          updated[index] = e.target.value;

          setCustomer({
            ...customer,
            about: {
              ...customer.about,
              highlights: updated,
            },
          });
        }}
      />

      <button
        type="button"
        className="text-red-600 px-2"
        onClick={() => {
          setCustomer({
            ...customer,
            about: {
              ...customer.about,
              highlights: (customer.about.highlights || []).filter(
                (_, i) => i !== index
              ),
            },
          });
        }}
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    className="text-sm text-indigo-600 font-medium"
    onClick={() => {
      setCustomer({
        ...customer,
        about: {
          ...customer.about,
          highlights: [
            ...(customer.about.highlights || []),
            "",
          ],
        },
      });
    }}
  >
    + Add bullet point
  </button>
</div>
</section>			
			
{/* -------- GALLERY -------- */}
<section className="mb-8">
  <h3 className="font-medium mb-3">Gallery</h3>

  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
    Upload photos directly or paste image links manually.
    Existing Google Drive image links still work exactly the same.
  </p>

  {/* ---------------- DIRECT UPLOAD ---------------- */}
  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center mb-5">
    <input
      type="file"
      accept="image/*,video/*"
      multiple
      onChange={async (e) => {
        const files = Array.from(e.target.files || []);

        for (const file of files) {
          await uploadGalleryImage(file);
        }
      }}
      className="block w-full text-sm text-gray-600
      file:mr-4 file:rounded-xl file:border-0
      file:bg-indigo-600 file:px-4 file:py-2
      file:text-white hover:file:bg-indigo-700"
    />

    <p className="mt-3 text-xs text-gray-500">
      Upload JPG, PNG, or WEBP images
    </p>

    {uploading && (
      <p className="mt-3 text-sm text-indigo-600">
        Uploading images...
      </p>
    )}
  </div>

{/* ---------------- IMAGE PREVIEW GRID ---------------- */}
{(customer.about.gallery || []).length > 0 && (
  <div className="grid grid-cols-2 gap-3 mb-5">
    {(customer.about.gallery || []).map((url, index) => (
      <div
        key={index}
        className="relative rounded-xl overflow-hidden border bg-white"
      >
        <img
          src={url}
          alt={`Gallery ${index}`}
          draggable
          onDragStart={(e) =>
            handleImageDragStart(e, url)
          }
          className="h-28 w-full object-cover cursor-grab"
        />

        <div className="flex gap-2 p-2">
          <button
            type="button"
            onClick={() => setBeforeImage(url)}
            className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
              beforeImage === url
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Set Before
          </button>

          <button
            type="button"
            onClick={() => setAfterImage(url)}
            className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
              afterImage === url
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            Set After
          </button>
        </div>

        <button
          type="button"
          className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-lg px-2 py-1 text-xs shadow"
          onClick={() => {
            setCustomer({
              ...customer,
              about: {
                ...customer.about,
                gallery: (customer.about.gallery || []).filter(
                  (_, i) => i !== index
                ),
              },
            });
          }}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
)}

{/* BEFORE / AFTER CREATOR */}
{(customer.about.gallery || []).length >= 2 && (
  <div className="mt-6 rounded-2xl border bg-white p-4">
    <h4 className="font-medium text-gray-800 mb-2">
      Before / After Creator
    </h4>

    <p className="text-xs text-gray-500 mb-4">
      Drag two gallery photos into the boxes, or tap Set Before and Set After
      above on mobile/tablet.
    </p>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) =>
          handleBeforeAfterDrop(e, "before")
        }
        className="h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
      >
        {beforeImage ? (
          <img
            src={beforeImage}
            alt="Before selected"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-500 text-center px-2">
            Drop BEFORE photo here
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) =>
          handleBeforeAfterDrop(e, "after")
        }
        className="h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
      >
        {afterImage ? (
          <img
            src={afterImage}
            alt="After selected"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-500 text-center px-2">
            Drop AFTER photo here
          </span>
        )}
      </div>
    </div>

    {beforeImage && afterImage && (
      <div className="space-y-3">
        <select
          value={beforeAfterMode}
          onChange={(e) =>
            setBeforeAfterMode(
              e.target.value as
                | "story"
                | "square"
                | "slider"
            )
          }
          className="w-full border rounded-md p-2 text-sm"
        >
          <option value="story">
            Instagram Story Image
          </option>

          <option value="square">
            Square Post Image
          </option>

          <option value="slider">
            Interactive Website Slider
          </option>
        </select>

        {beforeAfterMode !== "slider" ? (
          <button
            type="button"
            onClick={downloadBeforeAfterImage}
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium"
          >
            Download Image
          </button>
        ) : (
          <button
            type="button"
            onClick={saveSliderToPortfolio}
            className="w-full bg-emerald-600 text-white py-2 rounded-md font-medium"
          >
            Save Slider to Website
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setBeforeImage(null);
            setAfterImage(null);
          }}
          className="w-full text-sm text-gray-500"
        >
          Clear Selection
        </button>
      </div>
    )}
  </div>
)}

{/* SAVED BEFORE / AFTER SLIDERS */}
{(customer.beforeAfter || []).length > 0 && (
  <div className="mt-6 rounded-2xl border bg-white p-4">
    <h4 className="font-medium text-gray-800 mb-3">
      Saved Before / After Sliders
    </h4>

    <div className="space-y-3">
      {(customer.beforeAfter || []).map((item) => (
        <div
          key={item.id}
          className="rounded-xl border bg-gray-50 p-3"
        >
          <div className="grid grid-cols-2 gap-2 mb-3">
            <img
              src={item.beforeImage}
              alt="Before"
              className="h-24 w-full object-cover rounded-lg"
            />

            <img
              src={item.afterImage}
              alt="After"
              className="h-24 w-full object-cover rounded-lg"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-md bg-red-50 text-red-600 py-2 text-sm font-medium hover:bg-red-100"
            onClick={() => {
              if (!confirm("Remove this before/after slider?")) return;

              setCustomer({
                ...customer,
                beforeAfter: (customer.beforeAfter || []).filter(
                  (slider) => slider.id !== item.id
                ),
              });
            }}
          >
            Remove Slider
          </button>
        </div>
      ))}
    </div>

    <p className="mt-3 text-xs text-gray-500">
      Click “Save changes” after removing a slider.
    </p>
  </div>
)}


  {/* ---------------- MANUAL URL INPUTS ---------------- */}
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-700">
      Add image links manually
    </h4>

    {(customer.about.gallery || []).map((url, index) => (
      <div key={index} className="flex gap-2 mb-2">
        <input
          className="flex-1 border rounded-md p-2"
          placeholder="Google Drive image link"
          value={url}
          onChange={(e) => {
            const updated = [...(customer.about.gallery || [])];
            updated[index] = e.target.value;

            setCustomer({
              ...customer,
              about: {
                ...customer.about,
                gallery: updated,
              },
            });
          }}
        />

        <button
          type="button"
          className="text-red-600 px-2"
          onClick={() => {
            setCustomer({
              ...customer,
              about: {
                ...customer.about,
                gallery: (customer.about.gallery || []).filter(
                  (_, i) => i !== index
                ),
              },
            });
          }}
        >
          ✕
        </button>
      </div>
    ))}

    <button
      type="button"
      className="text-indigo-600 text-sm font-medium"
      onClick={() => {
        setCustomer({
          ...customer,
          about: {
            ...customer.about,
            gallery: [
              ...(customer.about.gallery || []),
              "",
            ],
          },
        });
      }}
    >
      + Add image link
    </button>
  </div>
</section>


{/* Testimonials */}
<section className="mb-8">
  <h3 className="font-medium mb-3">Testimonials</h3>

  <label className="flex items-center gap-2 mb-4">
    <input
      type="checkbox"
      checked={customer.testimonials?.enabled ?? false}
      onChange={(e) =>
        setCustomer({
          ...customer,
          testimonials: {
            enabled: e.target.checked,
            googleReviewLink:
              customer.testimonials?.googleReviewLink || "",
            reviews:
              customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ],
          },
        })
      }
    />
    Enable testimonials section
  </label>

  <div className="mb-6">
    <label className="block text-sm text-gray-600 mb-1">
      Google review link
    </label>

    <input
      className="w-full border rounded-md p-2"
      placeholder="https://g.page/r/..."
      value={customer.testimonials?.googleReviewLink || ""}
      onChange={(e) =>
        setCustomer({
          ...customer,
          testimonials: {
            enabled:
              customer.testimonials?.enabled ?? true,
            googleReviewLink: e.target.value,
            reviews:
              customer.testimonials?.reviews || [],
          },
        })
      }
    />
  </div>

  {[0, 1, 2].map((index) => {
    const review =
      customer.testimonials?.reviews?.[index] || {
        name: "",
        text: "",
      };

    return (
      <div
        key={index}
        className="border rounded-xl p-4 mb-4 bg-white"
      >
        <div className="font-medium text-sm mb-3">
          Review #{index + 1}
        </div>

        <input
          className="w-full border rounded-md p-2 mb-3"
          placeholder="Customer name"
          value={review.name}
          onChange={(e) => {
            const updated = [
              ...(customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ]),
            ];

            updated[index] = {
              ...updated[index],
              name: e.target.value,
            };

            setCustomer({
              ...customer,
              testimonials: {
                enabled:
                  customer.testimonials?.enabled ?? true,
                googleReviewLink:
                  customer.testimonials?.googleReviewLink ||
                  "",
                reviews: updated,
              },
            });
          }}
        />

        <textarea
          className="w-full border rounded-md p-2 text-sm"
          rows={4}
          placeholder="Customer review"
          value={review.text}
          onChange={(e) => {
            const updated = [
              ...(customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ]),
            ];

            updated[index] = {
              ...updated[index],
              text: e.target.value,
            };

            setCustomer({
              ...customer,
              testimonials: {
                enabled:
                  customer.testimonials?.enabled ?? true,
                googleReviewLink:
                  customer.testimonials?.googleReviewLink ||
                  "",
                reviews: updated,
              },
            });
          }}
        />

        <button
          type="button"
          className="mt-3 text-sm text-red-600"
          onClick={() => {
            const updated = [
              ...(customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ]),
            ];

            updated[index] = {
              name: "",
              text: "",
            };

            setCustomer({
              ...customer,
              testimonials: {
                enabled:
                  customer.testimonials?.enabled ?? true,
                googleReviewLink:
                  customer.testimonials?.googleReviewLink ||
                  "",
                reviews: updated,
              },
            });
          }}
        >
          Remove review
        </button>
      </div>
    );
  })}
</section>


{/* Contact Information */}
<section className="mb-8">
  <h3 className="font-medium mb-3">Contact information</h3>

  <p className="text-sm text-gray-500 mb-4">
    This information will appear below testimonials on your homepage.
  </p>

  {/* ADDRESS */}
  <div className="mb-4">
    <label className="block text-sm text-gray-600 mb-1">
      Address
    </label>

    <input
      className="w-full border rounded-md p-2"
      placeholder="Business address"
      value={customer.contact?.address || ""}
      onChange={(e) =>
        setCustomer({
          ...customer,
          contact: {
            ...(customer.contact || {}),
            address: e.target.value,
          },
        })
      }
    />
  </div>
  
  <div className="mb-4">
  <label className="block text-sm text-gray-600 mb-1">
    City
  </label>

  <input
    className="w-full border rounded-md p-2"
    placeholder="City"
    value={customer.contact?.city || ""}
    onChange={(e) =>
      setCustomer({
        ...customer,
        contact: {
          ...(customer.contact || {}),
          city: e.target.value,
        },
      })
    }
  />
</div>

<div className="mb-4">
  <label className="block text-sm text-gray-600 mb-1">
    Province / State
  </label>

  <input
    className="w-full border rounded-md p-2"
    placeholder="Province / State"
    value={customer.contact?.province || ""}
    onChange={(e) =>
      setCustomer({
        ...customer,
        contact: {
          ...(customer.contact || {}),
          province: e.target.value,
        },
      })
    }
  />
</div>

<div className="mb-4">
  <label className="block text-sm text-gray-600 mb-1">
    Country
  </label>

  <input
    className="w-full border rounded-md p-2"
    placeholder="Country"
    value={customer.contact?.country || ""}
    onChange={(e) =>
      setCustomer({
        ...customer,
        contact: {
          ...(customer.contact || {}),
          country: e.target.value,
        },
      })
    }
  />
</div>

  {/* EMAIL */}
  <div className="mb-4">
    <label className="block text-sm text-gray-600 mb-1">
      Email
    </label>

    <input
      type="email"
      className="w-full border rounded-md p-2"
      placeholder="Contact email"
      value={customer.contact?.email || ""}
      onChange={(e) =>
        setCustomer({
          ...customer,
          contact: {
            ...(customer.contact || {}),
            email: e.target.value,
          },
        })
      }
    />
  </div>

  {/* PHONE */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      Phone
    </label>

    <input
      className="w-full border rounded-md p-2"
      placeholder="Phone number"
      value={customer.contact?.phone || ""}
      onChange={(e) =>
        setCustomer({
          ...customer,
          contact: {
            ...(customer.contact || {}),
            phone: e.target.value,
          },
        })
      }
    />
  </div>
</section>

{/* Social Links */}
<section className="mb-8">
  <h3 className="font-medium mb-3">Social media links</h3>

  <p className="text-sm text-gray-500 mb-4">
    Optional. These links will appear below your contact information.
  </p>

  {[
    ["instagram", "Instagram URL"],
    ["tiktok", "TikTok URL"],
    ["x", "X / Twitter URL"],
    ["linkedin", "LinkedIn URL"],
  ].map(([key, label]) => (
    <div key={key} className="mb-4">
      <label className="block text-sm text-gray-600 mb-1">
        {label}
      </label>

      <input
        className="w-full border rounded-md p-2"
        placeholder={label}
        value={
          customer.socialLinks?.[
            key as keyof NonNullable<CustomerConfig["socialLinks"]>
          ] || ""
        }
        onChange={(e) =>
          setCustomer({
            ...customer,
            socialLinks: {
              ...(customer.socialLinks || {}),
              [key]: e.target.value,
            },
          })
        }
      />
    </div>
  ))}
</section>

{/* Schedule */}
<section className="mb-8 rounded-2xl border bg-white overflow-hidden">
  <button
    type="button"
    onClick={() => setScheduleOpen((prev) => !prev)}
    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
  >
    <div>
      <h3 className="font-medium">Schedule</h3>
      <p className="text-xs text-gray-500 mt-1">
        Set weekly availability for your schedule page.
      </p>
    </div>

    <span className="text-xl text-gray-500">
      {scheduleOpen ? "−" : "+"}
    </span>
  </button>

  {scheduleOpen && (
    <div className="border-t p-4">
      {(() => {
        const scheduleDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

        function buildTimeSlots(startHour: string, endHour: string) {
          const [startH, startM] = startHour.split(":").map(Number);
          const [endH, endM] = endHour.split(":").map(Number);

          const start = startH * 60 + startM;
          const end = endH * 60 + endM;

          const slots: string[] = [];

          for (let t = start; t < end; t += 30) {
            const h = Math.floor(t / 60);
            const m = t % 60;

            slots.push(
              `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
            );
          }

          return slots;
        }

        function getSchedule() {
          const currentCustomer = customer!;

          return {
            enabled: currentCustomer.schedule?.enabled ?? true,
            startHour: currentCustomer.schedule?.startHour || "08:00",
            endHour: currentCustomer.schedule?.endHour || "20:00",
            intervalMinutes: currentCustomer.schedule?.intervalMinutes || 30,
            days: {
              Mon: currentCustomer.schedule?.days?.Mon || [],
              Tue: currentCustomer.schedule?.days?.Tue || [],
              Wed: currentCustomer.schedule?.days?.Wed || [],
              Thu: currentCustomer.schedule?.days?.Thu || [],
              Fri: currentCustomer.schedule?.days?.Fri || [],
              Sat: currentCustomer.schedule?.days?.Sat || [],
              Sun: currentCustomer.schedule?.days?.Sun || [],
            },
          };
        }

        const schedule = getSchedule();
        const slots = buildTimeSlots(schedule.startHour, schedule.endHour);

        function updateSchedule(nextSchedule: CustomerConfig["schedule"]) {
          if (!customer) return;

          setCustomer({
            ...customer,
            schedule: nextSchedule,
          } as CustomerConfig);
        }

        function toggleTime(day: string, time: string) {
          const current = schedule.days[day as keyof typeof schedule.days] || [];
          const exists = current.includes(time);

          updateSchedule({
            ...schedule,
            days: {
              ...schedule.days,
              [day]: exists
                ? current.filter((t) => t !== time)
                : [...current, time].sort(),
            },
          });
        }

        return (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) =>
                  updateSchedule({
                    ...schedule,
                    enabled: e.target.checked,
                  })
                }
              />
              Enable schedule page
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">
                  Start time
                </label>
                <input
                  type="time"
                  step={1800}
                  className="w-full border rounded-md p-2"
                  value={schedule.startHour}
                  onChange={(e) =>
                    updateSchedule({
                      ...schedule,
                      startHour: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  End time
                </label>
                <input
                  type="time"
                  step={1800}
                  className="w-full border rounded-md p-2"
                  value={schedule.endHour}
                  onChange={(e) =>
                    updateSchedule({
                      ...schedule,
                      endHour: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Click the time blocks when you are available. Green means available.
            </p>

            {scheduleDays.map((day) => (
              <div key={day} className="border rounded-md p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{day}</div>

                  <button
                    type="button"
                    className="text-xs text-indigo-600 font-medium"
                    onClick={() =>
                      updateSchedule({
                        ...schedule,
                        days: {
                          ...schedule.days,
                          [day]: slots,
                        },
                      })
                    }
                  >
                    Select all
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const selected = schedule.days[day].includes(slot);

                    return (
                      <button
                        key={`${day}-${slot}`}
                        type="button"
                        onClick={() => toggleTime(day, slot)}
                        className={`rounded-md border px-2 py-2 text-xs transition ${
                          selected
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="mt-2 text-xs text-gray-500"
                  onClick={() =>
                    updateSchedule({
                      ...schedule,
                      days: {
                        ...schedule.days,
                        [day]: [],
                      },
                    })
                  }
                >
                  Clear {day}
                </button>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  )}
</section>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </aside>
      )}

      {/* ================= RIGHT: LIVE PREVIEW ================= */}
      <main className="flex-1 overflow-y-auto">
        <HomePage activeCustomer={customer} />
      </main>
    </div>
  );
}