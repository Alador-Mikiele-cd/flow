import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type {
  Design,
  StockMovement,
  Category,
} from "@/lib/types";

/* -------------------------------- */
/* SERIALIZE DESIGN                 */
/* -------------------------------- */
function serializeDesign(doc: any): Design {
  return {
    _id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    category: doc.category,

    piecesPerSirey: doc.piecesPerSirey,

    price: doc.price,

    // Total stock
    stock: doc.stock ?? 0,

    // Stock physically in the shop
    shopStock: doc.shopStock ?? 0,

    // Stock physically in storage
    storageStock: doc.storageStock ?? 0,

    lowStockThreshold:
      doc.lowStockThreshold,

    image: doc.image || undefined,

    sizes:
      doc.sizes || undefined,

    colors:
      doc.colors || undefined,

    createdAt:
      doc.createdAt?.toISOString?.() ??
      doc.createdAt,
  };
}

/* -------------------------------- */
/* SERIALIZE MOVEMENT               */
/* -------------------------------- */

function serializeMovement(
  doc: any
): StockMovement {
  return {
    _id: doc._id.toString(),

    designId:
      doc.designId.toString(),

    designCode:
      doc.designCode,

    type:
      doc.type,

    quantity:
      doc.quantity,

    from:
      doc.from,

    to:
      doc.to,

    note:
      doc.note,

    createdAt:
      doc.createdAt?.toISOString?.() ??
      doc.createdAt,
  };
}

/* -------------------------------- */
/* LIST DESIGNS                     */
/* -------------------------------- */

export async function listDesigns(): Promise<
  Design[]
> {
  const db = await getDb();

  const docs = await db
    .collection("designs")
    .find({})
    .sort({ code: 1 })
    .toArray();

  return docs.map(serializeDesign);
}

/* -------------------------------- */
/* GET DESIGN                       */
/* -------------------------------- */

export async function getDesign(
  id: string
): Promise<Design | null> {
  const db = await getDb();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const doc = await db
    .collection("designs")
    .findOne({
      _id: new ObjectId(id),
    });

  return doc
    ? serializeDesign(doc)
    : null;
}

/* -------------------------------- */
/* CREATE DESIGN                    */
/* -------------------------------- */

export async function createDesign(
  input: {
    code: string;
    name: string;
    category: Category;
    price: number;
    lowStockThreshold: number;

    // Initial stock goes into STORAGE
    initialStock: number;

    image?: string;
    sizes?: string[];
    colors?: string[];
  }
): Promise<Design> {
  const db = await getDb();

  const piecesPerSirey =
    input.category === "girls"
      ? 5
      : 6;

  const initialStock =
    Math.max(
      0,
      input.initialStock ?? 0
    );

  const doc = {
    code: input.code
      .trim()
      .toUpperCase(),

    name: input.name.trim(),

    category: input.category,

    piecesPerSirey,

    price: input.price,

    // New products start in STORAGE
    stock: 0,

    storageStock:
      initialStock,

    lowStockThreshold:
      input.lowStockThreshold,

    image:
      input.image?.trim() ||
      undefined,

    sizes:
      input.sizes?.length
        ? input.sizes
        : undefined,

    colors:
      input.colors?.length
        ? input.colors
        : undefined,

    createdAt: new Date(),
  };

  const result =
    await db
      .collection("designs")
      .insertOne(doc);

  if (initialStock > 0) {
    await logMovement({
      designId:
        result.insertedId.toString(),

      designCode:
        doc.code,

      type:
        "shipment",

      quantity:
        initialStock,

      to:
        "storage",

      note:
        "Initial stock",
    });
  }

  return serializeDesign({
    ...doc,
    _id:
      result.insertedId,
  });
}

/* -------------------------------- */
/* UPDATE DESIGN                    */
/* -------------------------------- */

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
    .updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: input,
      }
    );
}

/* -------------------------------- */
/* ADD STOCK TO STORAGE             */
/* -------------------------------- */

export async function addStock(
  id: string,
  quantity: number,
  note?: string
): Promise<Design> {
  const db = await getDb();

  if (quantity <= 0) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  const design =
    await db
      .collection("designs")
      .findOne({
        _id: new ObjectId(id),
      });

  if (!design) {
    throw new Error(
      "Design not found"
    );
  }

  await db
    .collection("designs")
    .updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $inc: {
          storageStock:
            quantity,
        },
      }
    );

  await logMovement({
    designId: id,

    designCode:
      design.code,

    type:
      "shipment",

    quantity,

    to:
      "storage",

    note,
  });

  const updated =
    await db
      .collection("designs")
      .findOne({
        _id: new ObjectId(id),
      });

  return serializeDesign(
    updated
  );
}

/* -------------------------------- */
/* MOVE STORAGE → SHOP              */
/* -------------------------------- */

export async function moveStorageToShop(
  id: string,
  quantity: number,
  note?: string
): Promise<Design> {
  const db = await getDb();

  if (quantity <= 0) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  const design =
    await db
      .collection("designs")
      .findOne({
        _id: new ObjectId(id),
      });

  if (!design) {
    throw new Error(
      "Design not found"
    );
  }

  const storageStock =
    design.storageStock ?? 0;

  if (storageStock < quantity) {
    throw new Error(
      `Not enough storage stock. Only ${storageStock} sireys available.`
    );
  }

  await db
    .collection("designs")
    .updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $inc: {
          storageStock:
            -quantity,

          stock:
            quantity,
        },
      }
    );

  await logMovement({
    designId: id,

    designCode:
      design.code,

    type:
      "transfer",

    quantity,

    from:
      "storage",

    to:
      "shop",

    note,
  });

  const updated =
    await db
      .collection("designs")
      .findOne({
        _id: new ObjectId(id),
      });

  return serializeDesign(
    updated
  );
}

/* -------------------------------- */
/* MOVE SHOP → STORAGE              */
/* -------------------------------- */

export async function moveShopToStorage(
  id: string,
  quantity: number,
  note?: string
): Promise<Design> {
  const db = await getDb();

  if (quantity <= 0) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  const design =
    await db
      .collection("designs")
      .findOne({
        _id: new ObjectId(id),
      });

  if (!design) {
    throw new Error(
      "Design not found"
    );
  }

  const shopStock =
    design.stock ?? 0;

  if (shopStock < quantity) {
    throw new Error(
      `Not enough shop stock. Only ${shopStock} sireys available.`
    );
  }

  await db
    .collection("designs")
    .updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $inc: {
          stock:
            -quantity,

          storageStock:
            quantity,
        },
      }
    );

  await logMovement({
    designId: id,

    designCode:
      design.code,

    type:
      "transfer",

    quantity,

    from:
      "shop",

    to:
      "storage",

    note,
  });

  const updated =
    await db
      .collection("designs")
      .findOne({
        _id: new ObjectId(id),
      });

  return serializeDesign(
    updated
  );
}

/* -------------------------------- */
/* DECREMENT SHOP STOCK FOR SALE    */
/* -------------------------------- */

export async function decrementStockForSale(
  id: string,
  quantity: number
): Promise<void> {
  const db = await getDb();

  if (quantity <= 0) {
    throw new Error(
      "Invalid sale quantity"
    );
  }

  const designId =
    new ObjectId(id);

  const design =
    await db
      .collection("designs")
      .findOne({
        _id: designId,
      });

  if (!design) {
    throw new Error(
      "Design not found"
    );
  }

  const shopStock =
    design.stock ?? 0;

  if (shopStock < quantity) {
    throw new Error(
      `Not enough shop stock for ${design.code}`
    );
  }

  await db
    .collection("designs")
    .updateOne(
      {
        _id: designId,
      },
      {
        $inc: {
          stock:
            -quantity,
        },
      }
    );

  await logMovement({
    designId: id,

    designCode:
      design.code,

    type:
      "sale",

    quantity:
      -quantity,

    from:
      "shop",

    note:
      "Sale",
  });

  // IMPORTANT:
  // DO NOT DELETE DESIGN WHEN STOCK = 0.
  //
  // The design can still exist because
  // storage may contain stock.
}

/* -------------------------------- */
/* LOG MOVEMENT                     */
/* -------------------------------- */

export async function logMovement(
  input: {
    designId: string;
    designCode: string;

    type:
      StockMovement["type"];

    quantity: number;

    from?:
      "storage" | "shop";

    to?:
      "storage" | "shop";

    note?: string;
  }
): Promise<void> {
  const db = await getDb();

  await db
    .collection("movements")
    .insertOne({
      designId:
        new ObjectId(
          input.designId
        ),

      designCode:
        input.designCode,

      type:
        input.type,

      quantity:
        input.quantity,

      from:
        input.from,

      to:
        input.to,

      note:
        input.note,

      createdAt:
        new Date(),
    });
}

/* -------------------------------- */
/* RECENT MOVEMENTS                 */
/* -------------------------------- */

export async function listRecentMovements(
  limit = 15
): Promise<StockMovement[]> {
  const db = await getDb();

  const docs =
    await db
      .collection("movements")
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .toArray();

  return docs.map(
    serializeMovement
  );
}

/* -------------------------------- */
/* DESIGN MOVEMENTS                 */
/* -------------------------------- */

export async function getDesignMovements(
  designId: string
): Promise<StockMovement[]> {
  const db = await getDb();

  if (!ObjectId.isValid(designId)) {
    return [];
  }

  const docs =
    await db
      .collection("movements")
      .find({
        designId:
          new ObjectId(
            designId
          ),
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

  return docs.map(
    serializeMovement
  );
}

/* -------------------------------- */
/* STOCK SUMMARY                    */
/* -------------------------------- */

export async function getStockSummary(
  designId: string,
  currentStock: number,
  currentStorageStock: number
) {
  const movements =
    await getDesignMovements(
      designId
    );

  const incoming =
    movements
      .filter(
        (m) =>
          m.type ===
          "shipment"
      )
      .reduce(
        (sum, m) =>
          sum + m.quantity,
        0
      );

  const transferredToShop =
    movements
      .filter(
        (m) =>
          m.type ===
            "transfer" &&
          m.to === "shop"
      )
      .reduce(
        (sum, m) =>
          sum + m.quantity,
        0
      );

  const transferredToStorage =
    movements
      .filter(
        (m) =>
          m.type ===
            "transfer" &&
          m.to === "storage"
      )
      .reduce(
        (sum, m) =>
          sum + m.quantity,
        0
      );

  const sold =
    movements
      .filter(
        (m) =>
          m.type ===
          "sale"
      )
      .reduce(
        (sum, m) =>
          sum + Math.abs(m.quantity),
        0
      );

  return {
    incoming,

    transferredToShop,

    transferredToStorage,

    sold,

    shop:
      currentStock,

    storage:
      currentStorageStock,

    total:
      currentStock +
      currentStorageStock,

    movements,
  };
}

/* -------------------------------- */
/* DELETE DESIGN                    */
/* -------------------------------- */

export async function deleteDesign(
  id: string
): Promise<void> {
  const db = await getDb();

  const designId =
    new ObjectId(id);

  const design =
    await db
      .collection("designs")
      .findOne({
        _id: designId,
      });

  if (!design) {
    throw new Error(
      "Design not found"
    );
  }

  await db
    .collection("movements")
    .deleteMany({
      designId,
    });

  const result =
    await db
      .collection("designs")
      .deleteOne({
        _id: designId,
      });

  if (
    result.deletedCount === 0
  ) {
    throw new Error(
      "Failed to delete design"
    );
  }
}