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
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] bg-black shadow-xl ring-1 ring-black/5 aspect-[4/5]">
        {/* AFTER IMAGE - full frame */}
        <img
          src={afterImage}
          alt="After"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* BEFORE IMAGE - same full frame, clipped by width */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - safePosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* DIVIDER */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${safePosition}%` }}
        />

        {/* LABELS */}
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-4 py-2 rounded-full font-bold italic">
          BEFORE
        </div>

        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-4 py-2 rounded-full font-bold italic">
          AFTER
        </div>

        {/* SLIDER */}
        <input
          type="range"
          min="1"
          max="99"
          value={safePosition}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute bottom-5 left-5 right-5 w-[calc(100%-2.5rem)]"
        />
      </div>
    </div>
  );
}