"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const empty = {
  name: "",
  code: "",
  category: "girls" as "girls" | "kids",
  price: "",
  initialStock: "",
  lowStockThreshold: "5",
  sizes: "",
  colors: "",
  image: "",
};

export default function AddDesignForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/designs", {
      method: "POST",
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
      setError(data.error || "Failed to add design");
      return;
    }

    setForm(empty);
    setOpen(false);
    router.refresh();
  }

  const piecesPerSirey = form.category === "girls" ? 5 : 6;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium bg-[#1A1A1A] text-white px-4 py-2.5 rounded-md hover:bg-[#333] transition-colors inline-flex items-center gap-1.5"
      >
        + Add Design
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl font-bold">Add New Design</h3>
          <button onClick={() => setOpen(false)} className="text-[#8A8378] hover:text-[#1A1A1A] text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-8">
          <div className="flex flex-col gap-4">
            <Field label="Design Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Girls Classic"
                className="input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Design Code">
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="S-102"
                  className="input"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as "girls" | "kids" })}
                  className="input"
                >
                  <option value="girls">Girls</option>
                  <option value="kids">Kids</option>
                </select>
              </Field>
            </div>

            <Field label="Sirey Type">
              <div className="flex border border-[#1A1A1A] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, category: "girls" })}
                  className={
                    "flex-1 text-xs font-medium py-2 " +
                    (form.category === "girls" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#1A1A1A]")
                  }
                >
                  Girls (5 pcs)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, category: "kids" })}
                  className={
                    "flex-1 text-xs font-medium py-2 border-l border-[#1A1A1A] " +
                    (form.category === "kids" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#1A1A1A]")
                  }
                >
                  Kids (6 pcs)
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Selling Price (Br)">
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="2500"
                  className="input"
                />
              </Field>
              <Field label="Current Stock">
                <input
                  type="number"
                  min="0"
                  value={form.initialStock}
                  onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
                  placeholder="15"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Low Stock Threshold">
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="input"
              />
            </Field>

            <Field label="Sizes (comma separated)">
              <input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="28, 29, 30, 31, 32"
                className="input"
              />
            </Field>

            <Field label="Colors (comma separated)">
              <input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Black, White, Pink"
                className="input"
              />
            </Field>

            <Field label="Product Image URL">
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
                className="input"
              />
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
                {loading ? "Creating…" : "+ Create Design"}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <span className="text-xs text-[#8A8378] mb-2 block">Live Preview</span>
            <div className="border border-[#ECE4D4] rounded-lg overflow-hidden">
              <div className="aspect-square bg-[#FBF4E8] relative flex items-center justify-center">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-[#B8AF9E]">No image</span>
                )}
                <span className="absolute top-2 left-2 text-[9px] font-mono bg-white/90 rounded px-1.5 py-0.5">
                  {form.code || "S-???"}
                </span>
                <span className="absolute top-2 right-2 text-[9px] font-medium bg-[#EAF7EE] text-[#1F5D3A] rounded-full px-2 py-0.5">
                  Healthy
                </span>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm">{form.name || "Design Name"}</div>
                <div className="text-[10px] text-[#8A8378] mb-2">
                  {form.category === "girls" ? "Girls Collection" : "Kids Collection"} · {form.category === "girls" ? "Girls" : "Kids"}
                </div>
                <div className="flex justify-between text-[10px] text-[#8A8378] mb-0.5">
                  <span>Pieces / Sirey</span>
                  <span className="font-medium text-[#1A1A1A]">{piecesPerSirey} pcs</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#8A8378] mb-0.5">
                  <span>Current Stock</span>
                  <span className="font-medium text-[#1A1A1A]">{form.initialStock || 0} Sireys</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#8A8378]">
                  <span>Selling Price</span>
                  <span className="font-medium text-[#C2703D]">{form.price || 0} Br</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

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
