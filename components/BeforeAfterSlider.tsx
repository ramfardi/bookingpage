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

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      {/* AFTER IMAGE */}

      <img
        src={afterImage}
        className="w-full h-[420px] object-cover"
      />

      {/* BEFORE IMAGE */}

      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{
          width: `${position}%`,
        }}
      >
        <img
          src={beforeImage}
          className="w-full h-[420px] object-cover"
        />
      </div>

      {/* DIVIDER */}

      <div
        className="absolute top-0 bottom-0 w-1 bg-white"
        style={{
          left: `${position}%`,
        }}
      />

      {/* SLIDER */}

      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) =>
          setPosition(Number(e.target.value))
        }
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