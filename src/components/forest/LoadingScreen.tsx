"use client";

import { useState, useEffect, useCallback } from "react";

export type LoadingStage = "loading" | "ready" | "done";

interface LoadingScreenProps {
  stage: LoadingStage;
  onFadeComplete: () => void;
}

const TREE_SILHOUETTES: [number, number, number][] = [
  [20, 35, 3],
  [30, 60, 10],
  [25, 80, 18],
  [15, 40, 27],
  [35, 95, 34],
  [20, 50, 44],
  [28, 70, 52],
  [22, 55, 61],
  [32, 85, 68],
  [18, 45, 77],
  [26, 65, 84],
  [24, 75, 92],
];

export default function LoadingScreen({
  stage,
  onFadeComplete,
}: LoadingScreenProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (stage === "ready") setFading(true);
  }, [stage]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (fading && e.target === e.currentTarget) onFadeComplete();
    },
    [fading, onFadeComplete]
  );

  if (stage === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a1a0a] transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Tree silhouettes at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] overflow-hidden opacity-20">
        {TREE_SILHOUETTES.map(([w, h, left], i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-t-full"
            style={{
              width: w,
              height: h,
              left: `${left}%`,
              backgroundColor: "#4ade80",
            }}
          />
        ))}
      </div>

      <h1 className="font-['Silkscreen'] text-3xl tracking-[0.15em] text-green-400 sm:text-4xl">
        GARDEN OF MAKERS
      </h1>

      <p className="mt-4 text-sm tracking-wider text-green-700">
        Growing the forest...
      </p>

      {/* Pulsing dots */}
      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-green-500"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
