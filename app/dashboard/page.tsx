import { listDesigns, listRecentMovements } from "@/lib/db/designs";
import { getRevenueSummary } from "@/lib/db/sales";

function fmt(n: number) {
  return n.toLocaleString();
}

export default async function OverviewPage() {
  const [designs, revenue, movements] = await Promise.all([
    listDesigns(),
    getRevenueSummary(),
    listRecentMovements(8),
  ]);

  const lowStock = designs.filter((d) => d.stock <= d.lowStockThreshold);
  const totalStock = designs.reduce((s, d) => s + d.stock, 0);

  const stats = [
    { label: "Revenue today", value: `${fmt(revenue.today.revenue)} Br`, bg: "#FDEDED", fg: "#C0392B" },
    { label: "Sold today", value: `${fmt(revenue.today.sireysSold)} Sireys`, bg: "#FEF6E7", fg: "#B7791F" },
    { label: "In stock", value: `${fmt(totalStock)} Sireys`, bg: "#EAF7EE", fg: "#1F5D3A" },
    { label: "Designs tracked", value: `${designs.length}`, bg: "#F1EEFB", fg: "#6C4FC4" },
  ];

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">Command Center</p>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">Your shop, today.</h1>
      <p className="text-[#8A8378] text-sm mb-8">
        {designs.length} designs tracked · {totalStock} Sireys on hand
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#ECE4D4] rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-2">{s.label}</div>
            <div className="font-serif text-2xl font-bold" style={{ color: s.fg }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ECE4D4] rounded-xl p-6">
          <h2 className="font-serif font-bold mb-4">Needs attention</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-[#8A8378]">Nothing low on stock right now.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStock.map((d) => (
                <div key={d._id} className="flex items-center justify-between bg-[#FDEDED] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    {d.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image} alt={d.code} className="w-9 h-9 rounded-md object-cover bg-white" />
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-white" />
                    )}
                    <div>
                      <div className="font-mono text-sm font-medium">{d.code}</div>
                      <div className="text-xs text-[#8A8378]">{d.name}</div>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-[#C0392B]">{d.stock} left</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#ECE4D4] rounded-xl p-6">
          <h2 className="font-serif font-bold mb-4">Recent activity</h2>
          {movements.length === 0 ? (
            <p className="text-sm text-[#8A8378]">No activity yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {movements.map((m) => (
                <div key={m._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-[#FBF4E8] px-2 py-1 rounded-md">{m.designCode}</span>
                    <span className="text-[#8A8378] text-xs">{m.type === "shipment" ? "shipment received" : "sold"}</span>
                  </div>
                  <span className={"font-mono text-xs font-semibold " + (m.quantity > 0 ? "text-[#1F5D3A]" : "text-[#1A1A1A]")}>
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
