import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSale, listSales } from "@/lib/db/sales";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const sales = await listSales();

  return NextResponse.json({ sales });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const items = body.items as {
    designId: string;
    quantity: number;
  }[];

  const paymentMethod = body.paymentMethod as
    | "cash"
    | "telebirr"
    | "bank";

  const amountReceived = Number(body.amountReceived);

  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json(
      { error: "Sale must include at least one item" },
      { status: 400 }
    );
  }

  if (!["cash", "telebirr", "bank"].includes(paymentMethod)) {
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(amountReceived) || amountReceived < 0) {
    return NextResponse.json(
      { error: "Invalid amount received" },
      { status: 400 }
    );
  }

  try {
    const sale = await createSale(
      items,
      paymentMethod,
      amountReceived
    );

    return NextResponse.json(
      { sale },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to record sale" },
      { status: 400 }
    );
  }
}