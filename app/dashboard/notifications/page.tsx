import { listDesigns } from "@/lib/db/designs";

export default async function NotificationsPage() {
  const designs = await listDesigns();
  const lowStock = designs.filter((d) => d.stock > 0 && d.stock <= d.lowStockThreshold);
  const outOfStock = designs.filter((d) => d.stock === 0);

  const notifications = [
    ...outOfStock.map((d) => ({ text: `${d.code} — ${d.name} is out of stock`, color: "#C0392B" })),
    ...lowStock.map((d) => ({ text: `${d.code} — ${d.name} is running low (${d.stock} left)`, color: "#B7791F" })),
  ];

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">Alerts</p>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">Notifications</h1>
      <p className="text-[#8A8378] text-sm mb-8">Low-stock and out-of-stock alerts, generated from live inventory.</p>

      {notifications.length === 0 ? (
        <p className="text-sm text-[#8A8378]">Nothing needs attention right now.</p>
      ) : (
        <div className="bg-white border border-[#ECE4D4] rounded-xl divide-y divide-[#ECE4D4] max-w-xl">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4">
              <span className="w-2 h-2 rounded-full" style={{ background: n.color }} />
              <span className="text-sm">{n.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
