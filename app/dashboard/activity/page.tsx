import { listRecentMovements } from "@/lib/db/designs";
import { listSales } from "@/lib/db/sales";

export default async function ActivityPage() {
  const [movements, sales] = await Promise.all([
    listRecentMovements(40),
    listSales(40),
  ]);

  type Event = { at: string; text: string; sub: string; color: string };

  const events: Event[] = [
    ...movements.map((m) => ({
      at: m.createdAt,
      text:
        m.type === "shipment"
          ? `Added ${m.quantity} × ${m.designCode} to stock`
          : `Sold ${Math.abs(m.quantity)} × ${m.designCode}`,
      sub: m.type === "shipment" ? m.note || "Shipment received" : "Sale",
      color: m.quantity > 0 ? "#1F5D3A" : "#C0392B",
    })),
    ...sales.map((s) => ({
      at: s.createdAt,
      text: `Completed sale #${s.receiptNumber} — ${s.totalQuantity} Sireys`,
      sub: `${s.total.toLocaleString()} Br`,
      color: "#C2703D",
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">Traceability</p>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">Activity</h1>
      <p className="text-[#8A8378] text-sm mb-8">Everything recorded in the shop, most recent first.</p>

      {events.length === 0 ? (
        <p className="text-sm text-[#8A8378]">Nothing recorded yet.</p>
      ) : (
        <div className="bg-white border border-[#ECE4D4] rounded-xl divide-y divide-[#ECE4D4]">
          {events.slice(0, 50).map((e, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                <div>
                  <div className="text-sm font-medium">{e.text}</div>
                  <div className="text-xs text-[#8A8378]">{e.sub}</div>
                </div>
              </div>
              <span className="text-xs text-[#8A8378]">{new Date(e.at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
