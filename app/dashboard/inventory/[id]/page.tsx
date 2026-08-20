import { getDesign, getStockSummary } from "@/lib/db/designs";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditDesignButton from "@/components/EditDesignButton";
import AddStockForm from "@/components/AddStockForm";
import DeleteDesignButton from "@/components/DeleteDesignButton";
import TransferStockForm from "@/components/TransferStockForm";
export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const design = await getDesign(id);

  if (!design) {
    notFound();
  }

  /*
    New stock system:

    shopStock     = stock currently in the shop
    storageStock  = stock currently in storage
    total         = shop + storage
  */

  const summary = await getStockSummary(
  id,
  design.stock,
  design.storageStock
);

  /*
    Stock status is based on shop stock because
    shopStock is what is currently available for selling.
  */

  const status =
  design.stock === 0
    ? "Out of Stock"
    : design.stock <= design.lowStockThreshold
    ? "Critical"
    : "Healthy";

  const statusColor =
    status === "Healthy"
      ? "#1F5D3A"
      : status === "Critical"
      ? "#C0392B"
      : "#8A8378";

  return (
    <div>
      {/* BACK */}

      <Link
        href="/dashboard/inventory"
        className="text-xs text-[#8A8378] hover:text-[#1A1A1A] inline-flex items-center gap-1 mb-6"
      >
        ← Back to Inventory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

        {/* ================================= */}
        {/* DESIGN INFORMATION                 */}
        {/* ================================= */}

        <div>
          {/* IMAGE */}

          <div className="aspect-square rounded-lg overflow-hidden bg-[#FBF4E8] border border-[#ECE4D4] mb-4">
            {design.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={design.image}
                alt={design.code}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#B8AF9E]">
                No image
              </div>
            )}
          </div>

          {/* CODE + STATUS */}

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-[#1A1A1A] text-white rounded px-1.5 py-0.5">
              {design.code}
            </span>

            <span
              className="text-[10px] font-medium flex items-center gap-1"
              style={{ color: statusColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: statusColor,
                }}
              />

              {status}
            </span>
          </div>

          {/* NAME */}

          <h1 className="font-serif text-2xl font-bold mb-0.5">
            {design.name}
          </h1>

          <p className="text-xs text-[#8A8378] mb-5">
            {design.category === "girls"
              ? "Girls"
              : "Kids"}{" "}
            Collection
          </p>

          {/* DESIGN INFO */}

          <div className="flex flex-col gap-2 mb-5">
            <InfoRow
              label="Pieces per Sirey"
              value={`${design.piecesPerSirey} pcs · ${
                design.category === "girls"
                  ? "Girls"
                  : "Kids"
              }`}
            />

            <InfoRow
              label="Selling Price"
              value={`${design.price.toLocaleString()} Br`}
              accent
            />

            <InfoRow
  label="Shop Stock"
  value={`${design.shopStock} Sireys`}
/>

            <InfoRow
              label="Storage Stock"
              value={`${design.storageStock} Sireys`}
            />

            <InfoRow
  label="Total Stock"
  value={`${design.stock + design.storageStock} Sireys`}
/>

            {design.sizes?.length ? (
              <InfoRow
                label="Sizes"
                value={design.sizes.join(" / ")}
              />
            ) : null}

            {design.colors?.length ? (
              <div className="bg-[#FBF4E8] rounded-lg px-4 py-3">
                <div className="text-[10px] uppercase text-[#8A8378] mb-1.5">
                  Colors
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {design.colors.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] bg-white border border-[#ECE4D4] rounded-full px-2 py-0.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col gap-3">
  <AddStockForm designId={design._id} />

  <TransferStockForm
    designId={design._id}
    storageStock={design.storageStock}
  />

  <div className="flex gap-2">
    <EditDesignButton design={design} />

    <DeleteDesignButton
      designId={design._id}
      designName={design.name}
    />
  </div>
</div>
        </div>

        {/* ================================= */}
        {/* STOCK INFORMATION                  */}
        {/* ================================= */}

        <div>

          {/* STOCK SUMMARY */}

          <div className="bg-white border border-[#ECE4D4] rounded-xl p-6 mb-6">
            <h2 className="font-serif font-bold mb-4">
              Stock Overview
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">

              <StatBox
                label="Shop"
                value={summary.shop}
                bg="#FBF4E8"
                fg="#C2703D"
              />

              <StatBox
                label="Storage"
                value={summary.storage}
                bg="#F3F0EA"
                fg="#1A1A1A"
              />

              <StatBox
                label="Total"
                value={summary.total}
                bg="#EAF7EE"
                fg="#1F5D3A"
              />

              <StatBox
                label="Incoming"
                value={summary.incoming}
                bg="#EAF7EE"
                fg="#1F5D3A"
                signed
              />

              <StatBox
                label="Moved to Shop"
                value={summary.transferredToShop}
                bg="#EEF4FA"
                fg="#2563EB"
                signed
              />

              <StatBox
                label="Sold"
                value={summary.sold}
                bg="#FDEDED"
                fg="#C0392B"
                signed
              />
            </div>

            {/* STOCK BREAKDOWN */}

            <div className="bg-[#1A1A1A] text-white rounded-lg px-4 py-4">

              <div className="text-[#B8AF9E] text-[10px] uppercase tracking-widest mb-3">
                Current Stock
              </div>

              <div className="grid grid-cols-3 gap-4">

                <div>
                  <div className="text-[10px] text-[#B8AF9E] mb-1">
                    Shop
                  </div>

                  <div className="font-mono text-lg font-semibold text-[#C2703D]">
                    {summary.shop}
                  </div>

                  <div className="text-[9px] text-[#B8AF9E]">
                    Sireys
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#B8AF9E] mb-1">
                    Storage
                  </div>

                  <div className="font-mono text-lg font-semibold">
                    {summary.storage}
                  </div>

                  <div className="text-[9px] text-[#B8AF9E]">
                    Sireys
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#B8AF9E] mb-1">
                    Total
                  </div>

                  <div className="font-mono text-lg font-semibold text-[#1F5D3A]">
                    {summary.total}
                  </div>

                  <div className="text-[9px] text-[#B8AF9E]">
                    Sireys
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* MOVEMENT TIMELINE */}

          <div className="bg-white border border-[#ECE4D4] rounded-xl p-6">

            <h2 className="font-serif font-bold mb-4">
              Movement Timeline
            </h2>

            {summary.movements.length === 0 ? (
              <p className="text-sm text-[#8A8378]">
                No movements recorded yet.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[#ECE4D4]">

                {summary.movements.map((m) => {

                  const isIncoming =
                    m.type === "shipment" &&
                    m.quantity > 0;

                  const isSale =
                    m.type === "sale";

                  const isTransfer =
                    m.type === "transfer";

                  const positive =
                    m.quantity > 0;

                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between py-3 gap-4"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        {/* ICON */}

                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                          style={{
                            background:
                              positive
                                ? "#EAF7EE"
                                : "#FDEDED",
                            color:
                              positive
                                ? "#1F5D3A"
                                : "#C0392B",
                          }}
                        >
                          {positive ? "↑" : "↓"}
                        </span>

                        {/* DETAILS */}

                        <div className="min-w-0">

                          <div className="text-sm font-medium">
                            {isIncoming
                              ? "Stock Received"
                              : isSale
                              ? "Sale"
                              : isTransfer
                              ? "Stock Transfer"
                              : "Stock Adjustment"}
                          </div>

                          <div className="text-[10px] text-[#8A8378] truncate">

                            {isIncoming
                              ? m.note ||
                                "Shipment received"
                              : isSale
                              ? `${Math.abs(
                                  m.quantity
                                )} Sireys sold`
                              : m.note ||
                                "Stock movement"}

                          </div>

                        </div>
                      </div>

                      {/* QUANTITY + DATE */}

                      <div className="text-right shrink-0">

                        <div
                          className="text-sm font-mono font-semibold"
                          style={{
                            color:
                              positive
                                ? "#1F5D3A"
                                : "#C0392B",
                          }}
                        >
                          {positive
                            ? "+"
                            : ""}
                          {m.quantity} Sireys
                        </div>

                        <div className="text-[10px] text-[#8A8378]">
                          {new Date(
                            m.createdAt
                          ).toLocaleString()}
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================= */
/* INFO ROW                          */
/* ================================= */

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#FBF4E8] rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <span className="text-[10px] uppercase text-[#8A8378]">
        {label}
      </span>

      <span
        className={
          "text-sm font-semibold text-right " +
          (accent
            ? "text-[#C2703D]"
            : "")
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ================================= */
/* STAT BOX                          */
/* ================================= */

function StatBox({
  label,
  value,
  bg,
  fg,
  signed,
}: {
  label: string;
  value: number;
  bg: string;
  fg: string;
  signed?: boolean;
}) {
  const display = signed
    ? value >= 0
      ? `+${value}`
      : `${value}`
    : `${value}`;

  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{
        background: bg,
      }}
    >
      <div className="text-[9px] uppercase text-[#8A8378] mb-1">
        {label}
      </div>

      <div
        className="font-serif font-bold text-lg"
        style={{
          color: fg,
        }}
      >
        {display}
      </div>

      <div className="text-[9px] text-[#8A8378]">
        Sireys
      </div>
    </div>
  );
}