import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listDesigns, createDesign } from "@/lib/db/designs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const designs = await listDesigns();
  return NextResponse.json({ designs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, name, category, price, lowStockThreshold, initialStock, image, sizes, colors } = body;

  if (!code || !name || !category || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (category !== "girls" && category !== "kids") {
    return NextResponse.json({ error: "Category must be 'girls' or 'kids'" }, { status: 400 });
  }

  try {
    const design = await createDesign({
      code,
      name,
      category,
      price: Number(price),
      lowStockThreshold: Number(lowStockThreshold) || 5,
      initialStock: Number(initialStock) || 0,
      image: image || undefined,
      sizes: Array.isArray(sizes) ? sizes : undefined,
      colors: Array.isArray(colors) ? colors : undefined,
    });
    return NextResponse.json({ design }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create design" }, { status: 500 });
  }
}
