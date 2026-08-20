import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const designs = db.collection("designs");
  const movements = db.collection("movements");

  const legacy = await designs.find({ storageStock: { $exists: false } }).toArray();
  const results: string[] = [];

  for (const d of legacy) {
    const legacyStock = d.stock ?? 0;

    await designs.updateOne(
      { _id: d._id },
      { $set: { storageStock: legacyStock, stock: 0 } }
    );

    if (legacyStock > 0) {
      await movements.insertOne({
        designId: d._id,
        designCode: d.code,
        type: "adjustment",
        quantity: legacyStock,
        to: "storage",
        note: "Migrated legacy stock into storage (shop/storage split introduced)",
        createdAt: new Date(),
      });
    }

    results.push(`Migrated ${d.code}: moved ${legacyStock} sireys from stock → storageStock`);
  }

  return NextResponse.json({ migrated: legacy.length, details: results });
}