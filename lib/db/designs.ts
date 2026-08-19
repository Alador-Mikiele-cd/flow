import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Design, StockMovement, Category } from "@/lib/types";

function serializeDesign(doc: any): Design {
  return {
    _id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    category: doc.category,
    piecesPerSirey: doc.piecesPerSirey,
    price: doc.price,
    stock: doc.stock,
    lowStockThreshold: doc.lowStockThreshold,
    image: doc.image || undefined,
    sizes: doc.sizes || undefined,
    colors: doc.colors || undefined,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
  };
}

function serializeMovement(doc: any): StockMovement {
  return {
    _id: doc._id.toString(),
    designId: doc.designId.toString(),
    designCode: doc.designCode,
    type: doc.type,
    quantity: doc.quantity,
    note: doc.note,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
  };
}

export async function listDesigns(): Promise<Design[]> {
  const db = await getDb();
  const docs = await db
    .collection("designs")
    .find({})
    .sort({ code: 1 })
    .toArray();
  return docs.map(serializeDesign);
}

export async function getDesign(id: string): Promise<Design | null> {
  const db = await getDb();
  const doc = await db.collection("designs").findOne({ _id: new ObjectId(id) });
  return doc ? serializeDesign(doc) : null;
}

export async function createDesign(input: {
  code: string;
  name: string;
  category: Category;
  price: number;
  lowStockThreshold: number;
  initialStock: number;
  image?: string;
  sizes?: string[];
  colors?: string[];
}): Promise<Design> {
  const db = await getDb();
  const piecesPerSirey = input.category === "girls" ? 5 : 6;

  const doc = {
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    category: input.category,
    piecesPerSirey,
    price: input.price,
    stock: input.initialStock ?? 0,
    lowStockThreshold: input.lowStockThreshold,
    image: input.image?.trim() || undefined,
    sizes: input.sizes?.length ? input.sizes : undefined,
    colors: input.colors?.length ? input.colors : undefined,
    createdAt: new Date(),
  };

  const result = await db.collection("designs").insertOne(doc);

  if (doc.stock > 0) {
    await logMovement({
      designId: result.insertedId.toString(),
      designCode: doc.code,
      type: "shipment",
      quantity: doc.stock,
      note: "Initial stock",
    });
  }

  return serializeDesign({ ...doc, _id: result.insertedId });
}

export async function updateDesign(
  id: string,
  input: Partial<{
    name: string;
    price: number;
    lowStockThreshold: number;
    image: string;
    sizes: string[];
    colors: string[];
  }>
): Promise<void> {
  const db = await getDb();
  await db
    .collection("designs")
    .updateOne({ _id: new ObjectId(id) }, { $set: input });
}

export async function addStock(
  id: string,
  quantity: number,
  note?: string
): Promise<Design> {
  const db = await getDb();
  const design = await db
    .collection("designs")
    .findOne({ _id: new ObjectId(id) });
  if (!design) throw new Error("Design not found");

  await db
    .collection("designs")
    .updateOne({ _id: new ObjectId(id) }, { $inc: { stock: quantity } });

  await logMovement({
    designId: id,
    designCode: design.code,
    type: "shipment",
    quantity,
    note,
  });

  const updated = await db
    .collection("designs")
    .findOne({ _id: new ObjectId(id) });
  return serializeDesign(updated);
}

export async function decrementStockForSale(
  id: string,
  quantity: number
): Promise<void> {
  const db = await getDb();

  const designId = new ObjectId(id);

  const design = await db.collection("designs").findOne({
    _id: designId,
  });

  if (!design) {
    throw new Error("Design not found");
  }

  if (design.stock < quantity) {
    throw new Error("Not enough stock");
  }

  const newStock = design.stock - quantity;

  // Record the sale movement first
  await logMovement({
    designId: id,
    designCode: design.code,
    type: "sale",
    quantity: -quantity,
  });

  if (newStock === 0) {
    // Stock is completely sold → automatically delete design
    await db.collection("designs").deleteOne({
      _id: designId,
    });

    // Remove movement history if you don't want it kept
    // await db.collection("movements").deleteMany({
    //   designId,
    // });

    return;
  }

  // Otherwise just reduce stock
  await db.collection("designs").updateOne(
    { _id: designId },
    {
      $set: {
        stock: newStock,
      },
    }
  );
}

export async function logMovement(input: {
  designId: string;
  designCode: string;
  type: StockMovement["type"];
  quantity: number;
  note?: string;
}): Promise<void> {
  const db = await getDb();
  await db.collection("movements").insertOne({
    designId: new ObjectId(input.designId),
    designCode: input.designCode,
    type: input.type,
    quantity: input.quantity,
    note: input.note,
    createdAt: new Date(),
  });
}

export async function listRecentMovements(limit = 15): Promise<StockMovement[]> {
  const db = await getDb();
  const docs = await db
    .collection("movements")
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(serializeMovement);
}

export async function getDesignMovements(designId: string): Promise<StockMovement[]> {
  const db = await getDb();
  const docs = await db
    .collection("movements")
    .find({ designId: new ObjectId(designId) })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serializeMovement);
}

export async function getStockSummary(designId: string, currentStock: number) {
  const movements = await getDesignMovements(designId);
  const incoming = movements
    .filter((m) => m.type === "shipment")
    .reduce((s, m) => s + m.quantity, 0);
  const sold = movements
    .filter((m) => m.type === "sale")
    .reduce((s, m) => s + m.quantity, 0); // stored negative
  const starting = currentStock - incoming - sold;
  return { starting, incoming, sold, current: currentStock, movements };
}

export async function deleteDesign(id: string): Promise<void> {
  const db = await getDb();

  const designId = new ObjectId(id);

  const design = await db.collection("designs").findOne({
    _id: designId,
  });

  if (!design) {
    throw new Error("Design not found");
  }

  // Delete stock movement history for this design
  await db.collection("movements").deleteMany({
    designId,
  });

  // Delete the design
  const result = await db.collection("designs").deleteOne({
    _id: designId,
  });

  if (result.deletedCount === 0) {
    throw new Error("Failed to delete design");
  }
}