"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStockForm({ designId }: { designId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/designs/${designId}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: Number(quantity), note: "Shipment received" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add stock");
      return;
    }

    setQuantity("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-xs font-medium bg-[#C2703D] text-white rounded-md px-3 py-1.5 hover:bg-[#A85F32] transition-colors"
      >
        + Stock
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        autoFocus
        required
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Qty"
        className="w-14 border border-[#ECE4D4] rounded-md px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-medium bg-[#C2703D] text-white rounded-md px-2 py-1 hover:bg-[#A85F32] disabled:opacity-60"
      >
        {loading ? "…" : "Add"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#8A8378]">
        ×
      </button>
      {error && <span className="text-[#C0392B] text-[10px]">{error}</span>}
    </form>
  );
}
