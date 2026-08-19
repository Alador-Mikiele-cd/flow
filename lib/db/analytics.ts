import { getDb } from "@/lib/mongodb";

export async function getReportSummary() {
  const db = await getDb();
  const sales = await db.collection("sales").find({}).toArray();

  const totalRevenue = sales.reduce((s, d) => s + (d.total || 0), 0);
  const totalSales = sales.length;
  const avgOrderValue = totalSales ? Math.round(totalRevenue / totalSales) : 0;

  return { totalRevenue, totalSales, avgOrderValue };
}

export async function getMonthlyRevenue(months = 8) {
  const db = await getDb();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const sales = await db
    .collection("sales")
    .find({ createdAt: { $gte: start } })
    .toArray();

  const buckets: { label: string; revenue: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: d.toLocaleString("en", { month: "short" }), revenue: 0 });
  }

  for (const sale of sales) {
    const d = new Date(sale.createdAt);
    const monthsAgo =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    const idx = months - 1 - monthsAgo;
    if (idx >= 0 && idx < buckets.length) buckets[idx].revenue += sale.total || 0;
  }

  return buckets;
}

export async function getBestSellers(limit = 5) {
  const db = await getDb();
  const result = await db
    .collection("sales")
    .aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.code",
          name: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit },
    ])
    .toArray();

  return result.map((r) => ({
    code: r._id as string,
    name: r.name as string,
    quantitySold: r.quantitySold as number,
    revenue: r.revenue as number,
  }));
}

export async function getSlowMovers(limit = 5) {
  const db = await getDb();

  const soldByCode = await db
    .collection("sales")
    .aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.code", quantitySold: { $sum: "$items.quantity" } } },
    ])
    .toArray();

  const soldMap = new Map(soldByCode.map((r) => [r._id as string, r.quantitySold as number]));

  const designs = await db.collection("designs").find({}).toArray();

  const withSales = designs.map((d) => ({
    code: d.code as string,
    name: d.name as string,
    stock: d.stock as number,
    quantitySold: soldMap.get(d.code) || 0,
  }));

  return withSales.sort((a, b) => a.quantitySold - b.quantitySold).slice(0, limit);
}
