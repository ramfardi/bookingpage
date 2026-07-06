"use client";

import { useState } from "react";

export default function LandingBeforeAfter({
  beforeImage,
  afterImage,
}: {
  beforeImage: string;
  afterImage: string;
}) {
  const [position, setPosition] = useState(50);

  return (
<div className="relative w-full overflow-hidden rounded-3xl shadow-xl
                aspect-[4/5] md:aspect-[4/3] lg:aspect-[16/10]">
      {/* AFTER IMAGE */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* BEFORE IMAGE */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* BEFORE LABEL */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur">
        Before
      </div>

      {/* AFTER LABEL */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur">
        After
      </div>

      {/* DIVIDER */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center font-bold text-gray-800">
          ↔
        </div>
      </div>

      {/* RANGE INPUT */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
      />
    </div>
  );
}