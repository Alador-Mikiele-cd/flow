import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const db = await getDb();

    const [sales, designs, movements] = await Promise.all([
      db
        .collection("sales")
        .find({})
        .sort({ createdAt: -1 })
        .toArray(),

      db
        .collection("designs")
        .find({})
        .sort({ code: 1 })
        .toArray(),

      db
        .collection("movements")
        .find({})
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    /* -------------------------------- */
    /* SALES                            */
    /* -------------------------------- */

    const salesRows = sales.map((sale) => ({
      Receipt: sale.receiptNumber,
      Date: sale.createdAt,
      TotalQuantity: sale.totalQuantity,
      Total: sale.total,
      PaymentMethod: sale.paymentMethod ?? "",
      AmountReceived: sale.amountReceived ?? "",
      Change: sale.change ?? "",
    }));

    /* -------------------------------- */
    /* SALE ITEMS                       */
    /* -------------------------------- */

    const saleItemsRows = sales.flatMap((sale) =>
      (sale.items ?? []).map((item: any) => ({
        Receipt: sale.receiptNumber,
        Date: sale.createdAt,
        DesignCode: item.code,
        DesignName: item.name,
        Quantity: item.quantity,
        Price: item.price,
        Subtotal: item.subtotal,
      }))
    );

    /* -------------------------------- */
    /* DESIGNS                          */
    /* -------------------------------- */

    const designRows = designs.map((design) => ({
      ID: design._id.toString(),
      Code: design.code,
      Name: design.name,
      Category: design.category,
      PiecesPerSirey: design.piecesPerSirey,
      Price: design.price,
      CurrentStock: design.stock,
      LowStockThreshold: design.lowStockThreshold,
      Sizes: (design.sizes ?? []).join(", "),
      Colors: (design.colors ?? []).join(", "),
      CreatedAt: design.createdAt,
    }));

    /* -------------------------------- */
    /* STOCK MOVEMENTS                  */
    /* -------------------------------- */

    const movementRows = movements.map((movement) => ({
      ID: movement._id.toString(),
      DesignID: movement.designId?.toString?.() ?? "",
      DesignCode: movement.designCode,
      Type: movement.type,
      Quantity: movement.quantity,
      Note: movement.note ?? "",
      Date: movement.createdAt,
    }));

    /* -------------------------------- */
    /* SUMMARY                          */
    /* -------------------------------- */

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (sale.total ?? 0),
      0
    );

    const totalItems = sales.reduce(
      (sum, sale) => sum + (sale.totalQuantity ?? 0),
      0
    );

    const totalStock = designs.reduce(
      (sum, design) => sum + (design.stock ?? 0),
      0
    );

    const summaryRows = [
      {
        Metric: "Total Receipts",
        Value: sales.length,
      },
      {
        Metric: "Total Items Sold",
        Value: totalItems,
      },
      {
        Metric: "Total Revenue",
        Value: totalRevenue,
      },
      {
        Metric: "Total Designs",
        Value: designs.length,
      },
      {
        Metric: "Current Stock",
        Value: totalStock,
      },
      {
        Metric: "Stock Movements",
        Value: movements.length,
      },
    ];

    /* -------------------------------- */
    /* CREATE EXCEL FILE                */
    /* -------------------------------- */

    const XLSX = await import("xlsx");

    const workbook = XLSX.utils.book_new();

    function addSheet(name: string, rows: any[]) {
      const worksheet = XLSX.utils.json_to_sheet(rows);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        name
      );
    }

    addSheet("Summary", summaryRows);
    addSheet("Sales", salesRows);
    addSheet("Sale Items", saleItemsRows);
    addSheet("Designs", designRows);
    addSheet("Stock Movements", movementRows);

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          `attachment; filename="sireyflow-records-${date}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);

    return NextResponse.json(
      { error: "Failed to export records" },
      { status: 500 }
    );
  }
}