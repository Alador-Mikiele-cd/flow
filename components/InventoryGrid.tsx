"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Design } from "@/lib/types";
import AddStockForm from "@/components/AddStockForm";

type Filter = "all" | "girls" | "kids" | "low" | "out";

export default function InventoryGrid({
  designs,
}: {
  designs: Design[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = designs;

    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (d) =>
          d.code.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q)
      );
    }

    if (filter === "girls" || filter === "kids") {
      list = list.filter((d) => d.category === filter);
    } else if (filter === "low") {
      list = list.filter(
        (d) => d.stock > 0 && d.stock <= d.lowStockThreshold
      );
    } else if (filter === "out") {
      list = list.filter((d) => d.stock === 0);
    }

    return list;
  }, [designs, search, filter]);

  const pills: { key: Filter; label: string }[] = [
    { key: "all", label: "All Designs" },
    { key: "girls", label: "Girls" },
    { key: "kids", label: "Kids" },
    { key: "low", label: "Low Stock" },
    { key: "out", label: "Out of Stock" },
  ];

  return (
    <div>
      {/* Search + Filters */}
      <div className="mb-7">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8378]"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by design name or code..."
            className="
              w-full
              h-11
              bg-white
              border border-[#ECE4D4]
              rounded-xl
              pl-11 pr-4
              text-sm
              outline-none
              transition-all
              placeholder:text-[#B8AF9E]
              focus:border-[#C2703D]
              focus:ring-2
              focus:ring-[#C2703D]/10
            "
          />
        </div>

        {/* Filter Bar */}
        <div className="mt-4 -mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-1 min-w-max">
            {pills.map((p) => (
              <button
                key={p.key}
                onClick={() => setFilter(p.key)}
                className={`
                  h-9
                  px-4
                  rounded-full
                  border
                  text-xs
                  font-medium
                  whitespace-nowrap
                  transition-all
                  active:scale-95
                  ${
                    filter === p.key
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                      : "bg-white text-[#5A5347] border-[#ECE4D4] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-[#8A8378]">
            Showing{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "design" : "designs"}
          </p>

          {search || filter !== "all" ? (
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="text-[11px] text-[#C2703D] font-medium hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#ECE4D4] rounded-2xl py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FBF4E8] flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-6 h-6 text-[#8A8378]"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </div>

          <h3 className="font-serif font-bold text-base mb-1">
            No designs found
          </h3>

          <p className="text-xs text-[#8A8378]">
            Try another search or change your filters.
          </p>
        </div>
      ) : (
        /* Product Grid */
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            gap-3
            sm:gap-5
          "
        >
          {filtered.map((d) => {
            const status =
              d.stock === 0
                ? "Out of Stock"
                : d.stock <= d.lowStockThreshold
                ? "Critical"
                : "Healthy";

            const statusColor =
              status === "Healthy"
                ? "#1F5D3A"
                : status === "Critical"
                ? "#C0392B"
                : "#8A8378";

            const pct = Math.min(
              100,
              Math.round(
                (d.stock /
                  Math.max(d.lowStockThreshold * 4, 1)) *
                  100
              )
            );

            return (
              <div
                key={d._id}
                className="
                  group
                  bg-white
                  border border-[#ECE4D4]
                  rounded-2xl
                  overflow-hidden
                  flex flex-col
                  transition-all
                  duration-200
                  hover:border-[#D7CDBB]
                  hover:shadow-[0_8px_30px_rgba(60,45,25,0.07)]
                "
              >
                {/* Image */}
                <Link
                  href={`/dashboard/inventory/${d._id}`}
                  className="
                    aspect-square
                    sm:aspect-[4/3]
                    bg-[#FBF4E8]
                    relative
                    overflow-hidden
                    block
                  "
                >
                  {d.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.image}
                      alt={d.code}
                      className="
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-[1.04]
                      "
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#B8AF9E]">
                      No image
                    </div>
                  )}

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors" />

                  {/* Design Code */}
                  <span
                    className="
                      absolute
                      top-2
                      left-2
                      text-[9px]
                      sm:text-[10px]
                      font-mono
                      bg-white/90
                      backdrop-blur-sm
                      rounded-md
                      px-2
                      py-1
                      shadow-sm
                    "
                  >
                    {d.code}
                  </span>

                  {/* Status */}
                  <span
                    className="
                      absolute
                      top-2
                      right-2
                      text-[8px]
                      sm:text-[9px]
                      font-medium
                      bg-white/90
                      backdrop-blur-sm
                      rounded-full
                      px-2
                      py-1
                      flex
                      items-center
                      gap-1
                      shadow-sm
                    "
                    style={{ color: statusColor }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: statusColor }}
                    />
                    <span className="hidden sm:inline">
                      {status}
                    </span>
                  </span>
                </Link>

                {/* Content */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  {/* Name */}
                  <Link
                    href={`/dashboard/inventory/${d._id}`}
                    className="font-semibold text-xs sm:text-sm truncate hover:text-[#C2703D] transition-colors"
                  >
                    {d.name}
                  </Link>

                  {/* Category */}
                  <div className="text-[9px] sm:text-[10px] text-[#8A8378] mt-1 mb-3">
                    {d.category === "girls" ? "Girls" : "Kids"} Collection
                    <span className="mx-1">·</span>
                    {d.piecesPerSirey} pcs / Sirey
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#FBF4E8] rounded-lg px-2.5 py-2">
                      <div className="text-[8px] uppercase tracking-wide text-[#8A8378]">
                        Stock
                      </div>

                      <div className="mt-0.5 font-semibold text-xs sm:text-sm">
                        {d.stock}
                        <span className="ml-1 text-[9px] sm:text-[10px] font-normal text-[#8A8378]">
                          Sireys
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FBF4E8] rounded-lg px-2.5 py-2 text-right">
                      <div className="text-[8px] uppercase tracking-wide text-[#8A8378]">
                        Price
                      </div>

                      <div className="mt-0.5 font-semibold text-xs sm:text-sm text-[#C2703D] truncate">
                        {d.price.toLocaleString()} Br
                      </div>
                    </div>
                  </div>

                  {/* Stock Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-[#8A8378]">
                        Stock level
                      </span>

                      <span
                        className="text-[8px] font-medium"
                        style={{ color: statusColor }}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#F0E9DA] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: statusColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto">
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0">
                        <AddStockForm designId={d._id} />
                      </div>

                      <Link
                        href={`/dashboard/inventory/${d._id}`}
                        className="
                          shrink-0
                          flex
                          items-center
                          justify-center
                          w-10
                          h-9
                          rounded-lg
                          border border-[#ECE4D4]
                          text-[#5A5347]
                          hover:bg-[#FBF4E8]
                          hover:border-[#D7CDBB]
                          transition-colors
                        "
                        title="View design"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="w-4 h-4"
                        >
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                          <circle cx="12" cy="12" r="2.5" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}