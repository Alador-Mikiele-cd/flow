import { getDesign, getStockSummary } from "@/lib/db/designs";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditDesignButton from "@/components/EditDesignButton";
import AddStockForm from "@/components/AddStockForm";
import DeleteDesignButton from "@/components/DeleteDesignButton";
export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const design = await getDesign(id);
  if (!design) notFound();

  const summary = await getStockSummary(id, design.stock);
  const status = design.stock === 0 ? "Out of Stock" : design.stock <= design.lowStockThreshold ? "Critical" : "Healthy";
  const statusColor = status === "Healthy" ? "#1F5D3A" : status === "Critical" ? "#C0392B" : "#8A8378";

  return (
    <div>
      <Link href="/dashboard/inventory" className="text-xs text-[#8A8378] hover:text-[#1A1A1A] inline-flex items-center gap-1 mb-6">
        ← Back to Inventory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-[#FBF4E8] border border-[#ECE4D4] mb-4">
            {design.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={design.image} alt={design.code} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#B8AF9E]">No image</div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-[#1A1A1A] text-white rounded px-1.5 py-0.5">{design.code}</span>
            <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: statusColor }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
              {status}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold mb-0.5">{design.name}</h1>
          <p className="text-xs text-[#8A8378] mb-5">
            {design.category === "girls" ? "Girls" : "Kids"} Collection
          </p>

          <div className="flex flex-col gap-2 mb-5">
            <InfoRow label="Pieces per Sirey" value={`${design.piecesPerSirey} pcs · ${design.category === "girls" ? "Girls" : "Kids"}`} />
            <InfoRow label="Selling Price" value={`${design.price.toLocaleString()} Br`} accent />
            {design.sizes?.length ? <InfoRow label="Sizes" value={design.sizes.join(" / ")} /> : null}
            {design.colors?.length ? (
              <div className="bg-[#FBF4E8] rounded-lg px-4 py-3">
                <div className="text-[10px] uppercase text-[#8A8378] mb-1.5">Colors</div>
                <div className="flex flex-wrap gap-1.5">
                  {design.colors.map((c) => (
                    <span key={c} className="text-[10px] bg-white border border-[#ECE4D4] rounded-full px-2 py-0.5">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2">
  <div className="flex-1">
    <AddStockForm designId={design._id} />
  </div>

  <EditDesignButton design={design} />

  <DeleteDesignButton
    designId={design._id}
    designName={design.name}
  />
</div>
        </div>

        <div>
          <div className="bg-white border border-[#ECE4D4] rounded-xl p-6 mb-6">
            <h2 className="font-serif font-bold mb-4">Stock Movement</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBox label="Starting" value={summary.starting} bg="#FBF4E8" fg="#1A1A1A" />
              <StatBox label="Incoming" value={summary.incoming} bg="#EAF7EE" fg="#1F5D3A" signed />
              <StatBox label="Sold" value={summary.sold} bg="#FDEDED" fg="#C0392B" signed />
              <StatBox label="Current" value={summary.current} bg="#FBF4E8" fg="#C2703D" />
            </div>
            <div className="bg-[#1A1A1A] text-white rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-[#B8AF9E] text-xs">Stock equation</span>
              <span className="font-mono">
                {summary.starting} {summary.incoming >= 0 ? "+" : "-"} {Math.abs(summary.incoming)} {summary.sold >= 0 ? "+" : "-"} {Math.abs(summary.sold)} = <span className="text-[#C2703D] font-semibold">{summary.current}</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#ECE4D4] rounded-xl p-6">
            <h2 className="font-serif font-bold mb-4">Movement Timeline</h2>
            {summary.movements.length === 0 ? (
              <p className="text-sm text-[#8A8378]">No movements recorded yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-[#ECE4D4]">
                {summary.movements.map((m) => (
                  <div key={m._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                        style={{
                          background: m.quantity > 0 ? "#EAF7EE" : "#FDEDED",
                          color: m.quantity > 0 ? "#1F5D3A" : "#C0392B",
                        }}
                      >
                        {m.quantity > 0 ? "↑" : "↓"}
                      </span>
                      <div>
                        <div className="text-sm font-medium">
                          {m.quantity > 0 ? "+" : ""}
                          {m.quantity} Sireys
                        </div>
                        <div className="text-[10px] text-[#8A8378]">
                          {m.type === "shipment" ? m.note || "Shipment received" : `${Math.abs(m.quantity)} Sireys sold`}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8A8378]">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#FBF4E8] rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-[10px] uppercase text-[#8A8378]">{label}</span>
      <span className={"text-sm font-semibold " + (accent ? "text-[#C2703D]" : "")}>{value}</span>
    </div>
  );
}

function StatBox({ label, value, bg, fg, signed }: { label: string; value: number; bg: string; fg: string; signed?: boolean }) {
  const display = signed ? (value >= 0 ? `+${value}` : `${value}`) : `${value}`;
  return (
    <div className="rounded-lg p-3 text-center" style={{ background: bg }}>
      <div className="text-[9px] uppercase text-[#8A8378] mb-1">{label}</div>
      <div className="font-serif font-bold text-lg" style={{ color: fg }}>
        {display}
      </div>
      <div className="text-[9px] text-[#8A8378]">Sireys</div>
    </div>
  );
}
