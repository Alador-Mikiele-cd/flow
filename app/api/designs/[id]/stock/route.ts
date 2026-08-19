import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  addStock,
  
} from "@/lib/db/designs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await req.json();

  const quantity = Number(body.quantity);

  if (!quantity || quantity <= 0) {
    return NextResponse.json(
      { error: "Quantity must be a positive number" },
      { status: 400 }
    );
  }

  try {
    const design = await addStock(
      id,
      quantity,
      body.note
    );

    return NextResponse.json({ design });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.message || "Failed to add stock",
      },
      { status: 500 }
    );
  }
}
