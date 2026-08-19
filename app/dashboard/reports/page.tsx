import { getReportSummary, getMonthlyRevenue, getBestSellers, getSlowMovers } from "@/lib/db/analytics";

export default async function ReportsPage() {
  const [summary, monthly, bestSellers, slowMovers] = await Promise.all([
    getReportSummary(),
    getMonthlyRevenue(8),
    getBestSellers(5),
    getSlowMovers(5),
  ]);

  const max = Math.max(...monthly.map((m) => m.revenue), 1);

  const points = monthly
    .map((m, i) => {
      const x =
        monthly.length === 1
          ? 280
          : (i / (monthly.length - 1)) * 560;

      const y = 120 - (m.revenue / max) * 110;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">
        Business Intelligence
      </p>

      <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">
        Reports &amp; Analytics
      </h1>

      <p className="text-[#8A8378] text-sm mb-8">
        Performance insights and trends.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#ECE4D4] rounded-xl p-5 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-2">
            Total Revenue
          </div>

          <div className="font-serif text-2xl font-bold text-[#C2703D] break-words">
            {summary.totalRevenue.toLocaleString()} Br
          </div>
        </div>

        <div className="bg-white border border-[#ECE4D4] rounded-xl p-5 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-2">
            Total Sales
          </div>

          <div className="font-serif text-2xl font-bold break-words">
            {summary.totalSales}
          </div>
        </div>

        <div className="bg-white border border-[#ECE4D4] rounded-xl p-5 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-2">
            Avg Order Value
          </div>

          <div className="font-serif text-2xl font-bold break-words">
            {summary.avgOrderValue.toLocaleString()} Br
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#ECE4D4] rounded-xl p-4 sm:p-6 mb-8 min-w-0">
        <h2 className="font-serif font-bold mb-1">
          Sales Performance
        </h2>

        <p className="text-xs text-[#8A8378] mb-4">
          Revenue over the last {monthly.length} months
        </p>

        <div className="w-full overflow-hidden">
          <svg
            viewBox="0 0 560 130"
            className="w-full h-40 min-w-0"
            preserveAspectRatio="none"
          >
            <polyline
              points={points}
              fill="none"
              stroke="#C2703D"
              strokeWidth="2"
            />

            <polygon
              points={`0,120 ${points} 560,120`}
              fill="#C2703D"
              opacity="0.08"
            />

            {monthly.map((m, i) => {
              const x =
                monthly.length === 1
                  ? 280
                  : (i / (monthly.length - 1)) * 560;

              return (
                <text
                  key={m.label + i}
                  x={x}
                  y={128}
                  fontSize="9"
                  fill="#8A8378"
                  textAnchor="middle"
                >
                  {m.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ECE4D4] rounded-xl p-4 sm:p-6 min-w-0">
          <h2 className="font-serif font-bold mb-4">
            Best-Selling Designs
          </h2>

          {bestSellers.length === 0 ? (
            <p className="text-sm text-[#8A8378]">
              No sales yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#ECE4D4]">
              {bestSellers.map((b, i) => (
                <div
                  key={b.code}
                  className="flex items-center justify-between gap-3 py-3 min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-[#FBF4E8] text-[#C2703D] text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="text-sm font-medium font-mono truncate">
                        {b.code}
                      </div>

                      <div className="text-xs text-[#8A8378] truncate">
                        {b.name} — {b.quantitySold} sold
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-sm text-[#C2703D] shrink-0 text-right">
                    {b.revenue.toLocaleString()} Br
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#ECE4D4] rounded-xl p-4 sm:p-6 min-w-0">
          <h2 className="font-serif font-bold mb-4 flex items-center gap-2">
            <span className="text-[#C0392B]">⚠</span>
            Slow-Moving Products
          </h2>

          {slowMovers.length === 0 ? (
            <p className="text-sm text-[#8A8378]">
              No designs yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#ECE4D4]">
              {slowMovers.map((s) => (
                <div
                  key={s.code}
                  className="flex items-center justify-between py-3 min-w-0"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium font-mono truncate">
                      {s.code}
                    </div>

                    <div className="text-xs text-[#8A8378] truncate">
                      Only {s.quantitySold} sold · {s.stock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}