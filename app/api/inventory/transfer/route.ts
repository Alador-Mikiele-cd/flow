import { NextResponse } from "next/server";
import { moveStorageToShop } from "@/lib/db/designs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const designId = body.designId;
    const quantity = Number(body.quantity);
    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : undefined;

    if (!designId || typeof designId !== "string") {
      return NextResponse.json(
        {
          error: "Design ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Quantity must be a positive whole number.",
        },
        {
          status: 400,
        }
      );
    }

    const design = await moveStorageToShop(
      designId,
      quantity,
      note
    );

    return NextResponse.json({
      success: true,
      design,
    });
  } catch (error) {
    console.error(
      "TRANSFER STORAGE → SHOP ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to transfer stock.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}