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

    const XLSX = await import("xlsx");

    const workbook = XLSX.utils.book_new();

    /* =====================================================
       1. SALE DETAILS
       One row for EACH design/shoe sold
    ===================================================== */

    const saleDetailsRows = sales.flatMap((sale) =>
      (sale.items ?? []).map((item: any) => {
        const piecesPerSirey =
          item.piecesPerSirey ??
          (item.category === "girls" ? 5 : 6);

        const sireys = item.quantity ?? 0;

        const pieces = sireys * piecesPerSirey;

        const subtotal =
          item.subtotal ??
          item.price * pieces;

        return {
          Receipt: sale.receiptNumber,

          Date: sale.createdAt
            ? new Date(sale.createdAt).toLocaleString()
            : "",

          DesignCode: item.code ?? "",

          DesignName: item.name ?? "",

          Category:
            item.category === "girls"
              ? "Girls"
              : "Kids",

          SireysSold: sireys,

          PiecesPerSirey: piecesPerSirey,

          PiecesSold: pieces,

          PricePerPiece: item.price ?? 0,

          ShoeTotal: subtotal,

          PaymentMethod:
            sale.paymentMethod ?? "",

          SaleTotal: sale.total ?? 0,

          AmountReceived:
            sale.amountReceived ?? 0,

          BalanceDue:
            sale.balanceDue ?? 0,

          Change:
            sale.change ?? 0,
        };
      })
    );

    /* =====================================================
       2. PAYMENTS
       One row for EACH receipt
    ===================================================== */

    const paymentRows = sales.map((sale) => ({
      Receipt: sale.receiptNumber,

      Date: sale.createdAt
        ? new Date(sale.createdAt).toLocaleString()
        : "",

      SaleTotal: sale.total ?? 0,

      AmountReceived:
        sale.amountReceived ?? 0,

      BalanceDue:
        sale.balanceDue ??
        Math.max(
          0,
          (sale.total ?? 0) -
            (sale.amountReceived ?? 0)
        ),

      Change:
        sale.change ??
        Math.max(
          0,
          (sale.amountReceived ?? 0) -
            (sale.total ?? 0)
        ),

      PaymentMethod:
        sale.paymentMethod ?? "",
    }));

    /* =====================================================
       3. SALES SUMMARY
    ===================================================== */

    const totalReceipts = sales.length;

    const totalSireys = sales.reduce(
      (sum, sale) =>
        sum + (sale.totalQuantity ?? 0),
      0
    );

    const totalPieces = sales.reduce(
      (sum, sale) => {
        if (sale.totalPieces != null) {
          return sum + sale.totalPieces;
        }

        return (
          sum +
          (sale.items ?? []).reduce(
            (itemSum: number, item: any) => {
              const piecesPerSirey =
                item.piecesPerSirey ??
                (item.category === "girls"
                  ? 5
                  : 6);

              return (
                itemSum +
                (item.quantity ?? 0) *
                  piecesPerSirey
              );
            },
            0
          )
        );
      },
      0
    );

    const totalSales = sales.reduce(
      (sum, sale) =>
        sum + (sale.total ?? 0),
      0
    );

    const totalReceived = sales.reduce(
      (sum, sale) =>
        sum + (sale.amountReceived ?? 0),
      0
    );

    const totalBalanceDue = sales.reduce(
      (sum, sale) => {
        const balance =
          sale.balanceDue ??
          Math.max(
            0,
            (sale.total ?? 0) -
              (sale.amountReceived ?? 0)
          );

        return sum + balance;
      },
      0
    );

    const totalChange = sales.reduce(
      (sum, sale) => {
        const change =
          sale.change ??
          Math.max(
            0,
            (sale.amountReceived ?? 0) -
              (sale.total ?? 0)
          );

        return sum + change;
      },
      0
    );

    const totalStock = designs.reduce(
      (sum, design) =>
        sum + (design.stock ?? 0),
      0
    );

    const summaryRows = [
      {
        Metric: "Total Receipts",
        Value: totalReceipts,
      },
      {
        Metric: "Total Sireys Sold",
        Value: totalSireys,
      },
      {
        Metric: "Total Pieces Sold",
        Value: totalPieces,
      },
      {
        Metric: "Total Sales",
        Value: totalSales,
      },
      {
        Metric: "Total Money Received",
        Value: totalReceived,
      },
      {
        Metric: "Total Balance Due",
        Value: totalBalanceDue,
      },
      {
        Metric: "Total Change",
        Value: totalChange,
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

    /* =====================================================
       4. CURRENT DESIGNS / INVENTORY
    ===================================================== */

    const designRows = designs.map(
      (design) => ({
        Code: design.code,

        Name: design.name,

        Category:
          design.category === "girls"
            ? "Girls"
            : "Kids",

        PiecesPerSirey:
          design.piecesPerSirey,

        PricePerPiece:
          design.price,

        PricePerSirey:
          design.price *
          design.piecesPerSirey,

        CurrentStockSireys:
          design.stock,

        CurrentStockPieces:
          design.stock *
          design.piecesPerSirey,

        LowStockThreshold:
          design.lowStockThreshold,

        Sizes:
          (design.sizes ?? []).join(", "),

        Colors:
          (design.colors ?? []).join(", "),

        CreatedAt: design.createdAt
          ? new Date(
              design.createdAt
            ).toLocaleString()
          : "",
      })
    );

    /* =====================================================
       5. STOCK MOVEMENTS
    ===================================================== */

    const movementRows = movements.map(
      (movement) => ({
        ID: movement._id.toString(),

        DesignCode:
          movement.designCode ?? "",

        Type: movement.type ?? "",

        QuantitySireys:
          movement.quantity ?? 0,

        Date: movement.createdAt
          ? new Date(
              movement.createdAt
            ).toLocaleString()
          : "",

        Note: movement.note ?? "",
      })
    );

    /* =====================================================
       6. ADD SHEETS
    ===================================================== */

    function addSheet(
      name: string,
      rows: Record<string, any>[]
    ) {
      const worksheet =
        XLSX.utils.json_to_sheet(rows);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        name
      );
    }

    addSheet(
      "Summary",
      summaryRows
    );

    addSheet(
      "Sale Details",
      saleDetailsRows
    );

    addSheet(
      "Payments",
      paymentRows
    );

    addSheet(
      "Inventory",
      designRows
    );

    addSheet(
      "Stock Movements",
      movementRows
    );

    /* =====================================================
       7. COLUMN WIDTHS
    ===================================================== */

    const widths: Record<
      string,
      number[]
    > = {
      Summary: [30, 20],

      "Sale Details": [
        12, // Receipt
        22, // Date
        14, // Code
        25, // Name
        12, // Category
        12, // Sireys
        16, // Pieces/Sirey
        14, // Pieces
        16, // Price
        16, // Shoe total
        16, // Payment
        16, // Sale total
        18, // Received
        16, // Balance
        14, // Change
      ],

      Payments: [
        12,
        22,
        18,
        20,
        18,
        14,
        18,
      ],

      Inventory: [
        14,
        25,
        12,
        16,
        18,
        18,
        20,
        20,
        20,
        20,
        25,
        25,
        22,
      ],

      "Stock Movements": [
        26,
        16,
        16,
        20,
        22,
        35,
      ],
    };

    const sheets =
      workbook.SheetNames;

    for (const sheetName of sheets) {
      const worksheet =
        workbook.Sheets[sheetName];

      const width =
        widths[sheetName];

      if (width) {
        worksheet["!cols"] =
          width.map((wch) => ({
            wch,
          }));
      }
    }

    /* =====================================================
       8. CREATE EXCEL FILE
    ===================================================== */

    const buffer = XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx",
      }
    );

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    return new NextResponse(
      buffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="sireyflow-records-${date}.xlsx"`,
        },
      }
    );
  } catch (error) {
    console.error(
      "Excel export error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to export records",
      },
      { status: 500 }
    );
  }
}