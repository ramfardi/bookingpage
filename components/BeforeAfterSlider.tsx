"use client";

import { useState } from "react";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
}: {
  beforeImage: string;
  afterImage: string;
}) {
  const [position, setPosition] = useState(50);

  const safePosition = Math.min(99, Math.max(1, position));

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-lg bg-black aspect-[16/9]">
      {/* AFTER IMAGE */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* BEFORE IMAGE */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{
          width: `${safePosition}%`,
        }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 h-full object-cover max-w-none"
          style={{
            width: `${10000 / safePosition}%`,
          }}
        />
      </div>

      {/* DIVIDER */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow"
        style={{
          left: `${safePosition}%`,
        }}
      />

      {/* SLIDER */}
      <input
        type="range"
        min="1"
        max="99"
        value={safePosition}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute bottom-4 left-4 right-4 w-[calc(100%-2rem)]"
      />

      {/* LABELS */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
        BEFORE
      </div>

      <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
        AFTER
      </div>
    </div>
  );
}