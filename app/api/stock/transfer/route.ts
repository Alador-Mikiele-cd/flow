import { NextResponse } from "next/server";
import { auth } from "@/auth";

import {
  moveStorageToShop,
  moveShopToStorage,
} from "@/lib/db/designs";

export async function POST(
  req: Request
) {
  const session =
    await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await req.json();

    const designId =
      String(
        body.designId || ""
      );

    const quantity =
      Number(
        body.quantity
      );

    const direction =
      body.direction;

    const note =
      body.note
        ? String(body.note)
        : undefined;

    if (!designId) {
      return NextResponse.json(
        {
          error:
            "Design ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Quantity must be a positive whole number",
        },
        {
          status: 400,
        }
      );
    }

    let design;

    if (
      direction ===
      "storage-to-shop"
    ) {
      design =
        await moveStorageToShop(
          designId,
          quantity,
          note
        );
    } else if (
      direction ===
      "shop-to-storage"
    ) {
      design =
        await moveShopToStorage(
          designId,
          quantity,
          note
        );
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid transfer direction",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      design,
    });
  } catch (err: any) {
    console.error(
      "STOCK TRANSFER ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to transfer stock",
      },
      {
        status: 400,
      }
    );
  }
}