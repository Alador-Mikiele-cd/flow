import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Sale, SaleItem } from "@/lib/types";
import { getDesign, decrementStockForSale } from "@/lib/db/designs";

function serializeSale(doc: any): Sale {
  return {
    _id: doc._id.toString(),
    receiptNumber: doc.receiptNumber,
    items: doc.items,
    totalQuantity: doc.totalQuantity,
    total: doc.total,

    paymentMethod: doc.paymentMethod,
    amountReceived: doc.amountReceived,
    change: doc.change,

    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
  };
}

async function nextReceiptNumber(): Promise<number> {
  const db = await getDb();
  const counters = db.collection("counters");
  const result = await counters.findOneAndUpdate(
    { _id: "receiptNumber" as any },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  // Start receipts at 10000 for a fuller-looking receipt number
  return 10000 + (result?.value ?? 1);
}

export async function createSale(
  items: { designId: string; quantity: number }[],
  paymentMethod: "cash" | "telebirr" | "bank",
  amountReceived: number
): Promise<Sale> {
  if (!items.length) throw new Error("Sale must have at least one item");

  const db = await getDb();
  const saleItems: SaleItem[] = [];

  for (const item of items) {
    if (item.quantity <= 0) continue;

    const design = await getDesign(item.designId);

    if (!design) {
      throw new Error(`Design ${item.designId} not found`);
    }

    if (design.stock < item.quantity) {
      throw new Error(
        `Not enough stock for ${design.code} — only ${design.stock} sireys left`
      );
    }

    saleItems.push({
      designId: design._id,
      code: design.code,
      name: design.name,
      quantity: item.quantity,
      price: design.price,
      subtotal: design.price * item.quantity,
    });
  }

  if (!saleItems.length) {
    throw new Error("Sale must have at least one item");
  }

  const totalQuantity = saleItems.reduce(
    (s, i) => s + i.quantity,
    0
  );

  const total = saleItems.reduce(
    (s, i) => s + i.subtotal,
    0
  );

  if (amountReceived < total) {
    throw new Error("Amount received cannot be less than the sale total");
  }

  const change = amountReceived - total;

  const receiptNumber = await nextReceiptNumber();

  const doc = {
    receiptNumber,
    items: saleItems,
    totalQuantity,
    total,
    paymentMethod,
    amountReceived,
    change,
    createdAt: new Date(),
  };

  const result = await db.collection("sales").insertOne(doc);

  for (const item of saleItems) {
    await decrementStockForSale(item.designId, item.quantity);
  }

  return serializeSale({ ...doc, _id: result.insertedId });
}
export async function getSale(id: string): Promise<Sale | null> {
  const db = await getDb();
  const doc = await db.collection("sales").findOne({ _id: new ObjectId(id) });
  return doc ? serializeSale(doc) : null;
}

export async function listSales(limit = 50): Promise<Sale[]> {
  const db = await getDb();
  const docs = await db
    .collection("sales")
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(serializeSale);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getRevenueSummary() {
  const db = await getDb();
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [todaySales, monthSales] = await Promise.all([
    db.collection("sales").find({ createdAt: { $gte: todayStart } }).toArray(),
    db.collection("sales").find({ createdAt: { $gte: monthStart } }).toArray(),
  ]);

  const sum = (arr: any[], key: "total" | "totalQuantity") =>
    arr.reduce((s, d) => s + (d[key] || 0), 0);

  return {
    today: { revenue: sum(todaySales, "total"), sireysSold: sum(todaySales, "totalQuantity") },
    month: { revenue: sum(monthSales, "total"), sireysSold: sum(monthSales, "totalQuantity") },
  };
}
