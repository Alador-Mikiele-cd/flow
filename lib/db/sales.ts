import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type {
  Sale,
  SaleItem,
} from "@/lib/types";

import {
  getDesign,
  decrementStockForSale,
} from "@/lib/db/designs";

/* -------------------------------- */
/* SERIALIZE SALE                   */
/* -------------------------------- */

function serializeSale(
  doc: any
): Sale {
  return {
    _id:
      doc._id.toString(),

    receiptNumber:
      doc.receiptNumber,

    items:
      (doc.items || []).map(
        (item: any) => ({
          designId:
            item.designId
              ?.toString?.() ??
            item.designId,

          code:
            item.code,

          name:
            item.name,

          category:
            item.category ??
            "kids",

          quantity:
            item.quantity,

          price:
            item.price,

          piecesPerSirey:
            item.piecesPerSirey ??
            (
              item.category ===
              "girls"
                ? 5
                : 6
            ),

          subtotal:
            item.subtotal,
        })
      ),

    totalQuantity:
      doc.totalQuantity ??
      0,

    totalPieces:
      doc.totalPieces ??
      (doc.items || []).reduce(
        (
          sum: number,
          item: any
        ) =>
          sum +
          (item.quantity || 0) *
            (
              item.piecesPerSirey ??
              (
                item.category ===
                "girls"
                  ? 5
                  : 6
              )
            ),
        0
      ),

    total:
      doc.total ?? 0,

    paymentMethod:
      doc.paymentMethod ??
      "cash",

    amountReceived:
      doc.amountReceived ??
      0,

    change:
      doc.change ?? 0,

    balanceDue:
      doc.balanceDue ??
      Math.max(
        0,
        (doc.total || 0) -
          (doc.amountReceived || 0)
      ),

    createdAt:
      doc.createdAt
        ?.toISOString?.() ??
      doc.createdAt,
  };
}

/* -------------------------------- */
/* RECEIPT NUMBER                   */
/* -------------------------------- */

async function nextReceiptNumber(): Promise<number> {
  const db = await getDb();

  const counters =
    db.collection(
      "counters"
    );

  const result =
    await counters.findOneAndUpdate(
      {
        _id:
          "receiptNumber" as any,
      },

      {
        $inc: {
          value: 1,
        },
      },

      {
        upsert: true,
        returnDocument:
          "after",
      }
    );

  return (
    10000 +
    (result?.value ?? 1)
  );
}

/* -------------------------------- */
/* CREATE SALE                      */
/* -------------------------------- */

export async function createSale(
  items: {
    designId: string;
    quantity: number;
  }[],

  paymentMethod:
    | "cash"
    | "telebirr"
    | "bank",

  amountReceived: number
): Promise<Sale> {
  if (!items.length) {
    throw new Error(
      "Sale must have at least one item"
    );
  }

  if (
    !Number.isFinite(
      amountReceived
    ) ||
    amountReceived < 0
  ) {
    throw new Error(
      "Invalid amount received"
    );
  }

  const db = await getDb();

  const saleItems:
    SaleItem[] = [];

  /* -------------------------------- */
  /* BUILD SALE ITEMS                 */
  /* -------------------------------- */

  for (const item of items) {
    if (item.quantity <= 0) {
      continue;
    }

    const design =
      await getDesign(
        item.designId
      );

    if (!design) {
      throw new Error(
        `Design ${item.designId} not found`
      );
    }

    // SALE COMES FROM SHOP STOCK
    if (
      design.stock <
      item.quantity
    ) {
      throw new Error(
        `Not enough shop stock for ${design.code} — only ${design.stock} sireys left`
      );
    }

    const piecesPerSirey =
      design.piecesPerSirey;

    const subtotal =
      design.price *
      piecesPerSirey *
      item.quantity;

    saleItems.push({
      designId:
        design._id,

      code:
        design.code,

      name:
        design.name,

      category:
        design.category,

      quantity:
        item.quantity,

      price:
        design.price,

      piecesPerSirey,

      subtotal,
    });
  }

  if (!saleItems.length) {
    throw new Error(
      "Sale must have at least one item"
    );
  }

  /* -------------------------------- */
  /* TOTALS                           */
  /* -------------------------------- */

  const totalQuantity =
    saleItems.reduce(
      (sum, item) =>
        sum +
        item.quantity,
      0
    );

  const totalPieces =
    saleItems.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          item.piecesPerSirey,
      0
    );

  const total =
    saleItems.reduce(
      (sum, item) =>
        sum +
        item.subtotal,
      0
    );

  const balanceDue =
    Math.max(
      0,
      total -
        amountReceived
    );

  const change =
    Math.max(
      0,
      amountReceived -
        total
    );

  /* -------------------------------- */
  /* RECEIPT NUMBER                   */
  /* -------------------------------- */

  const receiptNumber =
    await nextReceiptNumber();

  /* -------------------------------- */
  /* SALE DOCUMENT                    */
  /* -------------------------------- */

  const doc = {
    receiptNumber,

    items:
      saleItems,

    totalQuantity,

    totalPieces,

    total,

    paymentMethod,

    amountReceived,

    change,

    balanceDue,

    createdAt:
      new Date(),
  };

  const result =
    await db
      .collection("sales")
      .insertOne(doc);

  /* -------------------------------- */
  /* REDUCE SHOP STOCK                */
  /* -------------------------------- */

  for (const item of saleItems) {
    await decrementStockForSale(
      item.designId,
      item.quantity
    );
  }

  return serializeSale({
    ...doc,

    _id:
      result.insertedId,
  });
}

/* -------------------------------- */
/* GET ONE SALE                     */
/* -------------------------------- */

export async function getSale(
  id: string
): Promise<Sale | null> {
  const db = await getDb();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const doc =
    await db
      .collection("sales")
      .findOne({
        _id:
          new ObjectId(id),
      });

  return doc
    ? serializeSale(doc)
    : null;
}

/* -------------------------------- */
/* LIST SALES                       */
/* -------------------------------- */

export async function listSales(
  limit = 50
): Promise<Sale[]> {
  const db = await getDb();

  const docs =
    await db
      .collection("sales")
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .toArray();

  return docs.map(
    serializeSale
  );
}

/* -------------------------------- */
/* DATE HELPERS                     */
/* -------------------------------- */

function startOfDay(
  d: Date
) {
  const x =
    new Date(d);

  x.setHours(
    0,
    0,
    0,
    0
  );

  return x;
}

function startOfMonth(
  d: Date
) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    1
  );
}

/* -------------------------------- */
/* REVENUE SUMMARY                  */
/* -------------------------------- */

export async function getRevenueSummary() {
  const db = await getDb();

  const now =
    new Date();

  const todayStart =
    startOfDay(now);

  const monthStart =
    startOfMonth(now);

  const [
    todaySales,
    monthSales,
  ] =
    await Promise.all([
      db
        .collection("sales")
        .find({
          createdAt: {
            $gte:
              todayStart,
          },
        })
        .toArray(),

      db
        .collection("sales")
        .find({
          createdAt: {
            $gte:
              monthStart,
          },
        })
        .toArray(),
    ]);

  const sum = (
    arr: any[],
    key:
      | "total"
      | "totalQuantity"
  ) =>
    arr.reduce(
      (sum, sale) =>
        sum +
        (sale[key] || 0),
      0
    );

  return {
    today: {
      revenue:
        sum(
          todaySales,
          "total"
        ),

      sireysSold:
        sum(
          todaySales,
          "totalQuantity"
        ),
    },

    month: {
      revenue:
        sum(
          monthSales,
          "total"
        ),

      sireysSold:
        sum(
          monthSales,
          "totalQuantity"
        ),
    },
  };
}