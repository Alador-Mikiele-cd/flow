import { getSale } from "@/lib/db/sales";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await getSale(id);

  if (!sale) {
    notFound();
  }

  const date = new Date(
    sale.createdAt
  );

  const isPaid =
    sale.balanceDue === 0;

  const isPartial =
    sale.balanceDue > 0;

  return (
    <div className="flex flex-col items-center pt-4">

      {/* RECEIPT */}

      <div className="w-full max-w-sm bg-white border border-[#ECE4D4] rounded-xl p-8 font-mono text-sm">

        {/* HEADER */}

        <div className="text-center mb-6">

          <div className="w-10 h-10 rounded-md bg-[#1A1A1A] text-white flex items-center justify-center mx-auto mb-2 font-serif font-semibold">
            ስ
          </div>

          <div className="text-lg font-serif font-bold tracking-tight">
            SireyFlow
          </div>

          <div className="text-[10px] uppercase tracking-widest text-[#8A8378] mt-1">
            Wholesale · Addis Ababa
          </div>

        </div>

        {/* RECEIPT INFO */}

        <div className="text-center mb-6">

          <div className="font-semibold">
            SALE #{sale.receiptNumber}
          </div>

          <div className="text-[10px] text-[#8A8378] mt-1">
            {date.toLocaleDateString()}{" "}
            ·{" "}
            {date.toLocaleTimeString()}
          </div>

        </div>

        <div className="border-t border-dashed border-[#D8CFBB] my-4" />

        {/* ITEMS */}

        <div className="flex flex-col gap-4">

          {sale.items.map(
            (item, idx) => {

              const pricePerSirey =
                item.price *
                item.piecesPerSirey;

              return (
                <div
                  key={`${item.code}-${idx}`}
                  className="flex flex-col gap-1"
                >

                  {/* ITEM NAME */}

                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {item.code}
                    </span>

                    <span>
                      {item.subtotal.toLocaleString()} Br
                    </span>
                  </div>

                  {/* CALCULATION */}

                  <div className="text-[10px] text-[#8A8378]">
                    {item.quantity} sirey ×{" "}
                    {item.piecesPerSirey} pieces ×{" "}
                    {item.price.toLocaleString()} Br
                  </div>

                  <div className="text-[10px] text-[#8A8378]">
                    {item.name}
                  </div>

                  <div className="text-[10px] text-[#8A8378]">
                    {pricePerSirey.toLocaleString()} Br
                    / sirey
                  </div>

                </div>
              );
            }
          )}

        </div>

        <div className="border-t border-dashed border-[#D8CFBB] my-4" />

        {/* QUANTITY */}

        <div className="flex justify-between text-xs text-[#8A8378] mb-1">
          <span>Sireys</span>

          <span>
            {sale.totalQuantity}
          </span>
        </div>

        {/* PIECES */}

        <div className="flex justify-between text-xs text-[#8A8378] mb-1">
          <span>Pieces</span>

          <span>
            {sale.totalPieces}
          </span>
        </div>

        {/* TOTAL */}

        <div className="flex justify-between text-base font-semibold mt-3">

          <span>Total</span>

          <span className="text-[#C2703D]">
            {sale.total.toLocaleString()} Br
          </span>

        </div>

        {/* PAYMENT METHOD */}

        <div className="flex justify-between text-xs text-[#8A8378] mt-4">

          <span>
            Payment
          </span>

          <span className="capitalize">
            {sale.paymentMethod}
          </span>

        </div>

        {/* AMOUNT RECEIVED */}

        <div className="flex justify-between text-xs mt-2">

          <span>
            Amount Paid
          </span>

          <span>
            {sale.amountReceived.toLocaleString()} Br
          </span>

        </div>

        {/* BALANCE */}

        {isPartial && (
          <div className="flex justify-between text-sm font-semibold mt-3">

            <span className="text-[#C0392B]">
              Balance Due
            </span>

            <span className="text-[#C0392B]">
              {sale.balanceDue.toLocaleString()} Br
            </span>

          </div>
        )}

        {/* CHANGE */}

        {sale.change > 0 && (
          <div className="flex justify-between text-sm font-semibold mt-3">

            <span className="text-[#1F5D3A]">
              Change
            </span>

            <span className="text-[#1F5D3A]">
              {sale.change.toLocaleString()} Br
            </span>

          </div>
        )}

        {/* STATUS */}

        <div className="text-center mt-6">

          {isPaid ? (
            <span className="inline-block border-2 border-[#1F5D3A] text-[#1F5D3A] rounded-full px-4 py-1 font-semibold tracking-widest text-xs">
              PAID
            </span>
          ) : (
            <span className="inline-block border-2 border-[#C0392B] text-[#C0392B] rounded-full px-4 py-1 font-semibold tracking-widest text-xs">
              PARTIAL PAYMENT
            </span>
          )}

        </div>

        {/* BALANCE MESSAGE */}

        {isPartial && (
          <div className="text-center mt-4 text-[10px] text-[#8A8378]">
            Customer has{" "}
            <span className="font-semibold text-[#C0392B]">
              {sale.balanceDue.toLocaleString()} Br
            </span>{" "}
            remaining to pay.
          </div>
        )}

      </div>

      {/* ACTIONS */}

      <div className="flex gap-3 mt-6 print:hidden">

        <PrintButton />

        <Link
          href="/dashboard/sales"
          className="text-sm font-medium bg-[#1A1A1A] text-white rounded-md px-5 py-2.5 hover:bg-[#333] transition-colors"
        >
          New sale
        </Link>

      </div>

    </div>
  );
}