import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateDesign , deleteDesign,} from "@/lib/db/designs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (body.name !== undefined) update.name = body.name;
  if (body.price !== undefined) update.price = Number(body.price);
  if (body.lowStockThreshold !== undefined)
    update.lowStockThreshold = Number(body.lowStockThreshold);
  if (body.image !== undefined) update.image = body.image;
  if (Array.isArray(body.sizes)) update.sizes = body.sizes;
  if (Array.isArray(body.colors)) update.colors = body.colors;

  try {
    await updateDesign(id, update);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update design" }, { status: 500 });
  }
}


export async function DELETE(
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

  try {
    await deleteDesign(id);

    return NextResponse.json({
      success: true,
      message: "Design deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.message || "Failed to delete design",
      },
      { status: 400 }
    );
  }
}