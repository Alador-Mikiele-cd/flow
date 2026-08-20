"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Design } from "@/lib/types";

type CatFilter = "all" | "girls" | "kids";

export default function SellForm({
  designs,
  staffName,
}: {
  designs: Design[];
  staffName: string;
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<CatFilter>("all");

  const [qty, setQty] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "telebirr" | "bank">("cash");

  const [amountReceived, setAmountReceived] = useState("");

  const filtered = useMemo(() => {
    let list = designs;

    if (cat !== "all") {
      list = list.filter((d) => d.category === cat);
    }

    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (d) =>
          d.code.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [search, cat, designs]);

  function setQuantity(id: string, value: number, max: number) {
    const clamped = Math.max(0, Math.min(value, max));

    setQty((q) => ({
      ...q,
      [id]: clamped,
    }));
  }

  const items = designs
    .map((d) => ({
      design: d,
      quantity: qty[d._id] || 0,
    }))
    .filter((i) => i.quantity > 0);

  const total = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.design.price * item.design.piecesPerSirey,
    0
  );

  const totalPieces = items.reduce(
    (sum, item) => sum + item.quantity * item.design.piecesPerSirey,
    0
  );

  const totalSireys = items.reduce((sum, item) => sum + item.quantity, 0);

  const received = Number(amountReceived) || 0;

  const balanceDue = Math.max(0, total - received);

  const change = Math.max(0, received - total);

  async function completeSale() {
    if (!items.length) {
      setError("Please add at least one item.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sales", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          items: items.map((i) => ({
            designId: i.design._id,
            quantity: i.quantity,
          })),

          paymentMethod,

          amountReceived: received,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to complete sale");

        setLoading(false);
        return;
      }

      setLoading(false);

      router.push(`/dashboard/sales/${data.sale._id}`);
    } catch (err) {
      console.error(err);

      setError("Something went wrong. Please try again.");

      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search design or scan code…"
          className="w-full border border-[#ECE4D4] rounded-md px-4 py-2.5 text-sm bg-white mb-4 outline-none focus:border-[#C2703D]"
        />

        <div className="flex gap-2 mb-6">
          {(["all", "girls", "kids"] as CatFilter[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={
                "text-xs font-medium px-3.5 py-2 rounded-md border transition-colors capitalize " +
                (cat === c
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-[#5A5347] border-[#ECE4D4] hover:border-[#1A1A1A]")
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => {
            const q = qty[d._id] || 0;

            // FIX: shopStock is never written to the database anywhere in
            // this app — addStock, moveStorageToShop, and
            // decrementStockForSale all update "stock", not "shopStock".
            // So d.shopStock is always 0, and since 0 is not
            // null/undefined, "d.shopStock ?? d.stock ?? 0" never reached
            // d.stock. Reading d.stock directly is correct.
            const shopStock = d.stock ?? 0;

            const storageStock = d.storageStock ?? 0;

            const disabled = shopStock === 0;

            return (
              <button
                key={d._id}
                type="button"
                disabled={disabled}
                onClick={() => setQuantity(d._id, q + 1, shopStock)}
                className={
                  "text-left bg-white border border-[#ECE4D4] rounded-lg overflow-hidden hover:border-[#1A1A1A] transition-all " +
                  (disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:-translate-y-0.5")
                }
              >
                <div className="aspect-square bg-[#FBF4E8] relative">
                  {d.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.image}
                      alt={d.code}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#B8AF9E]">
                      No image
                    </div>
                  )}

                  <span className="absolute top-2 left-2 text-[9px] font-mono bg-white/90 rounded px-1.5 py-0.5">
                    {d.code}
                  </span>

                  <span className="absolute bottom-2 right-2 text-[9px] font-medium bg-black/70 text-white rounded px-1.5 py-0.5">
                    {shopStock} shop
                  </span>

                  {q > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C2703D] text-white text-[10px] font-semibold flex items-center justify-center">
                      {q}
                    </span>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="text-xs font-medium truncate">{d.name}</div>

                  <div className="text-xs font-mono text-[#C2703D] mt-0.5">
                    {d.price.toLocaleString()} Br / piece
                  </div>

                  <div className="text-[9px] text-[#8A8378] mt-1">
                    {d.category === "girls" ? "Girls" : "Kids"} •{" "}
                    {d.piecesPerSirey} pcs / Sirey
                  </div>

                  <div className="text-[9px] text-[#8A8378] mt-1">
                    Sirey: {(d.price * d.piecesPerSirey).toLocaleString()} Br
                  </div>

                  <div className="grid grid-cols-2 gap-1 mt-2">
                    <div className="bg-[#FBF4E8] rounded px-2 py-1.5">
                      <div className="text-[8px] uppercase tracking-wide text-[#8A8378]">
                        Shop
                      </div>

                      <div className="text-[10px] font-mono font-semibold">
                        {shopStock}
                      </div>
                    </div>

                    <div className="bg-[#F8F5EF] rounded px-2 py-1.5">
                      <div className="text-[8px] uppercase tracking-wide text-[#8A8378]">
                        Storage
                      </div>

                      <div className="text-[10px] font-mono font-semibold">
                        {storageStock}
                      </div>
                    </div>
                  </div>

                  {d.colors?.length ? (
                    <div className="mt-2">
                      <div className="text-[9px] uppercase text-[#8A8378] mb-1">
                        Colors
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {d.colors.map((color) => (
                          <span
                            key={color}
                            className="text-[9px] bg-[#FBF4E8] border border-[#ECE4D4] rounded-full px-2 py-0.5"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {d.sizes?.length ? (
                    <InfoRow label="Sizes" value={d.sizes.join(" / ")} />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-medium">No designs found</p>

            <p className="text-xs text-[#8A8378] mt-1">
              Try another search or category.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#ECE4D4] rounded-xl p-5 h-fit sticky top-8">
        <div className="flex items-center gap-2 mb-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-4 h-4"
          >
            <circle cx="9" cy="20" r="1.4" />

            <circle cx="18" cy="20" r="1.4" />

            <path d="M2 3h3l2.6 12.6a2 2 0 002 1.6H18a2 2 0 002-1.6L22 7H6" />
          </svg>

          <h3 className="font-serif font-bold">Current Sale</h3>
        </div>

        <p className="text-[10px] text-[#8A8378] mb-5">Staff: {staffName}</p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FBF4E8] flex items-center justify-center mb-3">
              🛒
            </div>

            <p className="text-sm font-medium">No items in cart</p>

            <p className="text-xs text-[#8A8378] mt-0.5">
              Tap a design to add it
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4 max-h-[320px] overflow-y-auto">
            {items.map((i) => {
              // FIX: same dead-field issue as above — read
              // i.design.stock directly instead of falling back through
              // the never-set i.design.shopStock field.
              const shopStock = i.design.stock ?? 0;

              return (
                <div
                  key={i.design._id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#ECE4D4] rounded-md">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(i.design._id, i.quantity - 1, shopStock)
                        }
                        className="w-6 h-6 text-xs hover:bg-[#FBF4E8]"
                      >
                        −
                      </button>

                      <span className="w-6 text-center font-mono text-xs">
                        {i.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(i.design._id, i.quantity + 1, shopStock)
                        }
                        className="w-6 h-6 text-xs hover:bg-[#FBF4E8]"
                      >
                        +
                      </button>
                    </div>

                    <div>
                      <div className="text-xs">{i.design.code}</div>

                      <div className="text-[9px] text-[#8A8378]">
                        {i.design.price.toLocaleString()} ×{" "}
                        {i.design.piecesPerSirey}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs">
                    {(
                      i.quantity *
                      i.design.price *
                      i.design.piecesPerSirey
                    ).toLocaleString()}{" "}
                    Br
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-[#ECE4D4] pt-4 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-2">
            Payment Method
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {(["cash", "telebirr", "bank"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={
                  "py-2 rounded-md border text-[10px] font-medium capitalize transition-colors " +
                  (paymentMethod === method
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-[#5A5347] border-[#ECE4D4] hover:border-[#1A1A1A]")
                }
              >
                {method}
              </button>
            ))}
          </div>

          <label className="block text-[10px] uppercase tracking-widest text-[#8A8378] mb-2">
            Amount Received
          </label>

          <div className="relative">
            <input
              type="number"
              min="0"
              value={amountReceived}
              onChange={(e) => {
                setAmountReceived(e.target.value);
                setError("");
              }}
              placeholder="0"
              className="w-full border border-[#ECE4D4] rounded-md px-3 py-2.5 pr-12 text-sm font-mono outline-none focus:border-[#C2703D]"
            />

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8A8378]">
              Br
            </span>
          </div>

          {received < total && total > 0 && (
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-[#8A8378]">Balance Due</span>

              <span className="font-mono font-semibold text-[#C0392B]">
                {balanceDue.toLocaleString()} Br
              </span>
            </div>
          )}

          {received > total && total > 0 && (
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-[#8A8378]">Change</span>

              <span className="font-mono font-semibold text-[#1F5D3A]">
                {change.toLocaleString()} Br
              </span>
            </div>
          )}

          {received === total && total > 0 && (
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-[#8A8378]">Payment</span>

              <span className="font-semibold text-[#1F5D3A]">Fully Paid</span>
            </div>
          )}
        </div>

        <div className="border-t border-[#ECE4D4] pt-4 mb-4">
          <div className="flex justify-between text-xs text-[#8A8378] mb-1">
            <span>Sireys ({totalSireys})</span>

            <span className="font-mono">{totalPieces} pieces</span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="font-serif font-bold">Total</span>

            <span className="font-mono text-xl font-bold text-[#C2703D]">
              {total.toLocaleString()} Br
            </span>
          </div>
        </div>

        {error && <p className="text-[#C0392B] text-xs mb-3">{error}</p>}

        <button
          type="button"
          onClick={completeSale}
          disabled={loading || !items.length}
          className="w-full bg-[#C2703D] text-white text-sm font-semibold rounded-md py-3 hover:bg-[#A85F32] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : "Complete Sale"}
        </button>

        {items.length > 0 && received < total && (
          <p className="text-[9px] text-[#8A8378] text-center mt-2">
            The remaining {balanceDue.toLocaleString()} Br will be recorded as
            balance due.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FBF4E8] rounded-lg px-3 py-2 mt-2">
      <div className="text-[9px] uppercase text-[#8A8378] mb-1">{label}</div>

      <div className="text-[10px] font-medium text-[#1A1A1A]">{value}</div>
    </div>
  );
}