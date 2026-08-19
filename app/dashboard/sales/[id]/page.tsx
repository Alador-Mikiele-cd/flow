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

  if (!sale) notFound();

  const date = new Date(sale.createdAt);

  const paymentLabel = {
    cash: "Cash",
    telebirr: "Telebirr",
    bank: "Bank",
  }[sale.paymentMethod];

  return (
    <div className="flex flex-col items-center pt-4">
      {/* RECEIPT */}
      <div className="w-full max-w-sm bg-white border border-[#ECE4D4] rounded-xl p-8 font-mono text-sm">
        {/* SHOP HEADER */}
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
            {date.toLocaleDateString()} · {date.toLocaleTimeString()}
          </div>
        </div>

        <div className="border-t border-dashed border-[#D8CFBB] my-4" />

        {/* ITEMS */}
        <div className="flex flex-col gap-3">
          {sale.items.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between">
                <span>
                  {item.quantity} × {item.code}
                </span>

                <span>
                  {item.subtotal.toLocaleString()} Br
                </span>
              </div>

              <div className="text-[10px] text-[#8A8378] mt-0.5">
                {item.name}
              </div>

              <div className="text-[10px] text-[#8A8378]">
                {item.price.toLocaleString()} Br × {item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-[#D8CFBB] my-4" />

        {/* QUANTITY */}
        <div className="flex justify-between text-xs text-[#8A8378] mb-1">
          <span>Sireys</span>

          <span>{sale.totalQuantity}</span>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between text-base font-semibold mt-2">
          <span>Total</span>

          <span className="text-[#C2703D]">
            {sale.total.toLocaleString()} Br
          </span>
        </div>

        {/* PAYMENT INFORMATION */}
        <div className="border-t border-dashed border-[#D8CFBB] my-4" />

        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#8A8378]">
            Payment Method
          </span>

          <span className="font-semibold">
            {paymentLabel}
          </span>
        </div>

        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#8A8378]">
            Amount Received
          </span>

          <span>
            {sale.amountReceived.toLocaleString()} Br
          </span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-[#8A8378]">
            Change
          </span>

          <span className="font-semibold">
            {sale.change.toLocaleString()} Br
          </span>
        </div>

        {/* PAID */}
        <div className="text-center mt-6">
          <span className="inline-block border-2 border-[#1F5D3A] text-[#1F5D3A] rounded-full px-4 py-1 font-semibold tracking-widest text-xs">
            PAID
          </span>
        </div>

        {/* FOOTER */}
        <div className="text-center text-[9px] text-[#8A8378] mt-6">
          Thank you for your business.
        </div>
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