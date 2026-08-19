"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Design } from "@/lib/types";

export default function EditDesignButton({ design }: { design: Design }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: design.name,
    price: String(design.price),
    lowStockThreshold: String(design.lowStockThreshold),
    sizes: design.sizes?.join(", ") || "",
    colors: design.colors?.join(", ") || "",
    image: design.image || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/designs/${design._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update design");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium border border-[#ECE4D4] rounded-md px-4 py-2.5 hover:bg-[#FBF4E8]"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl w-full max-w-md p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl font-bold">Edit {design.code}</h3>
          <button onClick={() => setOpen(false)} className="text-[#8A8378] hover:text-[#1A1A1A] text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Design Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Selling Price (Br)">
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Low Stock Threshold">
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="input"
              />
            </Field>
          </div>
          <Field label="Sizes (comma separated)">
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="input" />
          </Field>
          <Field label="Colors (comma separated)">
            <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="input" />
          </Field>
          <Field label="Product Image URL">
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
          </Field>

          {error && <p className="text-[#C0392B] text-xs">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 text-sm font-medium border border-[#ECE4D4] rounded-md py-2.5 hover:bg-[#FBF4E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm font-medium bg-[#1A1A1A] text-white rounded-md py-2.5 hover:bg-[#333] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        <style jsx global>{`
          .input {
            width: 100%;
            border: 1px solid #ece4d4;
            border-radius: 8px;
            background: white;
            padding: 9px 12px;
            font-size: 13px;
          }
          .input:focus {
            outline: none;
            border-color: #1a1a1a;
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#5A5347] mb-1">{label}</label>
      {children}
    </div>
  );
}
