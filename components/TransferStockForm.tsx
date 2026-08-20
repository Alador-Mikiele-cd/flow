"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TransferStockForm({
  designId,
  storageStock,
}: {
  designId: string;
  storageStock: number;
}) {
  const router = useRouter();

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function transferToShop() {
    setError("");

    const amount = Number(quantity);

    // Validate quantity
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter a valid whole number of Sireys.");
      return;
    }

    // Validate storage stock
    if (amount > storageStock) {
      setError(
        `Only ${storageStock} Sireys are available in storage.`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          designId,
          quantity: amount,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Failed to transfer stock."
        );
        setLoading(false);
        return;
      }

      // Reset form
      setQuantity("");
      setNote("");
      setError("");
      setLoading(false);

      // Refresh server data
      router.refresh();
    } catch (error) {
      console.error("Transfer error:", error);

      setError(
        "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  const hasStorage = storageStock > 0;

  return (
    <div className="bg-white border border-[#ECE4D4] rounded-xl p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-serif font-bold">
          Move to Shop
        </h2>

        <span className="text-[10px] uppercase tracking-widest text-[#8A8378]">
          Storage → Shop
        </span>
      </div>

      <p className="text-xs text-[#8A8378] mb-5">
        Move Sireys from storage to the shop so they
        become available for sale.
      </p>

      {/* STOCK INFORMATION */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* STORAGE */}
        <div className="bg-[#FBF4E8] rounded-lg p-3">
          <p className="text-[9px] uppercase tracking-widest text-[#8A8378] mb-1">
            In Storage
          </p>

          <p className="font-serif text-xl font-bold">
            {storageStock}
          </p>

          <p className="text-[9px] text-[#8A8378]">
            Sireys available
          </p>
        </div>

        {/* DESTINATION */}
        <div className="bg-[#EAF7EE] rounded-lg p-3">
          <p className="text-[9px] uppercase tracking-widest text-[#1F5D3A] mb-1">
            Destination
          </p>

          <p className="font-serif text-xl font-bold text-[#1F5D3A]">
            Shop
          </p>

          <p className="text-[9px] text-[#8A8378]">
            Available for sales
          </p>
        </div>
      </div>

      {/* QUANTITY */}
      <label
        htmlFor="transfer-quantity"
        className="block text-[10px] uppercase tracking-widest text-[#8A8378] mb-2"
      >
        Sireys to Move
      </label>

      <div className="relative mb-3">
        <input
          id="transfer-quantity"
          type="number"
          min="1"
          max={storageStock}
          step="1"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError("");
          }}
          placeholder="0"
          disabled={loading || !hasStorage}
          className="w-full border border-[#ECE4D4] rounded-md px-3 py-2.5 pr-16 text-sm font-mono outline-none focus:border-[#C2703D] disabled:bg-[#F8F5EF] disabled:cursor-not-allowed"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8A8378]">
          Sireys
        </span>
      </div>

      {/* QUICK AMOUNTS */}
      {hasStorage && (
        <div className="flex gap-2 mb-4">
          {/* 1 */}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setQuantity("1");
              setError("");
            }}
            className="flex-1 border border-[#ECE4D4] rounded-md py-2 text-[10px] hover:border-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            1
          </button>

          {/* 5 */}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setQuantity(
                String(Math.min(5, storageStock))
              );
              setError("");
            }}
            className="flex-1 border border-[#ECE4D4] rounded-md py-2 text-[10px] hover:border-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            5
          </button>

          {/* 10 */}
          <button
            type="button"
            disabled={
              loading || storageStock < 10
            }
            onClick={() => {
              setQuantity(
                String(Math.min(10, storageStock))
              );
              setError("");
            }}
            className="flex-1 border border-[#ECE4D4] rounded-md py-2 text-[10px] hover:border-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            10
          </button>

          {/* ALL */}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setQuantity(String(storageStock));
              setError("");
            }}
            className="flex-1 border border-[#ECE4D4] rounded-md py-2 text-[10px] hover:border-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            All
          </button>
        </div>
      )}

      {/* NOTE */}
      <label
        htmlFor="transfer-note"
        className="block text-[10px] uppercase tracking-widest text-[#8A8378] mb-2"
      >
        Note{" "}
        <span className="normal-case">
          (optional)
        </span>
      </label>

      <input
        id="transfer-note"
        type="text"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setError("");
        }}
        placeholder="e.g. Restocking shop"
        disabled={loading || !hasStorage}
        className="w-full border border-[#ECE4D4] rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#C2703D] mb-4 disabled:bg-[#F8F5EF] disabled:cursor-not-allowed"
      />

      {/* ERROR */}
      {error && (
        <div className="bg-[#FDEDED] border border-[#F3CACA] text-[#C0392B] rounded-md px-3 py-2.5 text-xs mb-4">
          {error}
        </div>
      )}

      {/* BUTTON */}
      <button
        type="button"
        onClick={transferToShop}
        disabled={
          loading ||
          !hasStorage ||
          !quantity
        }
        className="w-full bg-[#1A1A1A] text-white rounded-md py-3 text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? "Moving..."
          : !hasStorage
          ? "No Stock in Storage"
          : "Move to Shop →"}
      </button>

      {/* HELP TEXT */}
      <p className="text-[9px] text-[#8A8378] text-center mt-2">
        Moving stock does not create new stock. It only
        moves it from storage to the shop.
      </p>
    </div>
  );
}