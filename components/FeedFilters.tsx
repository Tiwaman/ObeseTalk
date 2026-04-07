"use client";

import { WHO_OPTIONS, WHERE_OPTIONS } from "@/lib/utils";

interface FeedFiltersProps {
  sort: "latest" | "top";
  whoFilter: string;
  whereFilter: string;
  onSortChange: (sort: "latest" | "top") => void;
  onWhoChange: (who: string) => void;
  onWhereChange: (where: string) => void;
}

export default function FeedFilters({
  sort,
  whoFilter,
  whereFilter,
  onSortChange,
  onWhoChange,
  onWhereChange,
}: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex rounded-full overflow-hidden border border-warm-brown/15 bg-white">
        <button
          onClick={() => onSortChange("latest")}
          className={`px-4 py-2 text-xs font-sans font-medium transition-colors ${
            sort === "latest"
              ? "bg-coral text-white"
              : "text-warm-brown/60 hover:bg-coral/10"
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => onSortChange("top")}
          className={`px-4 py-2 text-xs font-sans font-medium transition-colors ${
            sort === "top"
              ? "bg-coral text-white"
              : "text-warm-brown/60 hover:bg-coral/10"
          }`}
        >
          Most Relatable
        </button>
      </div>

      <select
        value={whoFilter}
        onChange={(e) => onWhoChange(e.target.value)}
        className="px-3 py-2 rounded-full border border-warm-brown/15 bg-white text-xs font-sans text-warm-brown/70 focus:outline-none focus:border-coral/40"
      >
        <option value="">All people</option>
        {WHO_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      <select
        value={whereFilter}
        onChange={(e) => onWhereChange(e.target.value)}
        className="px-3 py-2 rounded-full border border-warm-brown/15 bg-white text-xs font-sans text-warm-brown/70 focus:outline-none focus:border-coral/40"
      >
        <option value="">All places</option>
        {WHERE_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
