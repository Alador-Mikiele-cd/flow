import { listSales } from "@/lib/db/sales";
import Link from "next/link";

export default async function SalesHistoryPage() {
  const sales = await listSales();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.totalQuantity, 0);

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C2703D] font-semibold mb-2">
            Records
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Sales History
          </h1>

          <p className="text-[#8A8378] text-sm">
            Every transaction, all in one place.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-1">
            Total Revenue
          </p>

          <p className="font-serif text-2xl font-bold text-[#C2703D]">
            {totalRevenue.toLocaleString()} Br
          </p>
        </div>
      </div>

      {/* Stats */}
      {sales.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-[#ECE4D4] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-1">
              Receipts
            </p>

            <p className="font-serif text-xl font-bold">
              {sales.length}
            </p>
          </div>

          <div className="bg-white border border-[#ECE4D4] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-1">
              Items Sold
            </p>

            <p className="font-serif text-xl font-bold">
              {totalItems}
            </p>
          </div>

          <div className="hidden sm:block bg-white border border-[#ECE4D4] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-1">
              Average Sale
            </p>

            <p className="font-serif text-xl font-bold">
              {Math.round(totalRevenue / sales.length).toLocaleString()} Br
            </p>
          </div>
        </div>
      )}

      {sales.length === 0 ? (
        <div className="bg-white border border-[#ECE4D4] rounded-2xl p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FBF4E8] flex items-center justify-center text-[#C2703D]">
            +
          </div>

          <h2 className="font-serif text-lg font-bold mb-1">
            No sales yet
          </h2>

          <p className="text-sm text-[#8A8378]">
            Completed sales will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#ECE4D4] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(60,45,30,0.03)]">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-[120px_1fr_100px_110px_100px_160px] gap-4 px-6 py-3 bg-[#FBF4E8] border-b border-[#ECE4D4] text-[10px] uppercase tracking-[0.15em] text-[#8A8378] font-semibold">
            <span>Receipt</span>
            <span>Items</span>
            <span>Quantity</span>
            <span>Payment</span>
            <span>Total</span>
            <span>Date</span>
          </div>

          {sales.map((s) => (
            <Link
              key={s._id}
              href={`/dashboard/sales/${s._id}`}
              className="group block md:grid md:grid-cols-[120px_1fr_100px_110px_100px_160px] gap-4 px-5 sm:px-6 py-5 items-center border-b border-[#ECE4D4] last:border-b-0 hover:bg-[#FFFCF7] transition-all duration-200"
            >
              {/* Receipt */}
              <div className="flex items-center justify-between md:block mb-3 md:mb-0">
                <div>
                  <p className="md:hidden text-[9px] uppercase tracking-widest text-[#8A8378] mb-1">
                    Receipt
                  </p>

                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#FBF4E8] text-[#C2703D] font-mono text-xs font-semibold group-hover:bg-[#C2703D] group-hover:text-white transition-colors">
                    #{s.receiptNumber}
                  </span>
                </div>

                <span className="md:hidden text-xs text-[#8A8378]">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Items */}
              <div className="min-w-0 mb-4 md:mb-0">
                <p className="md:hidden text-[9px] uppercase tracking-widest text-[#8A8378] mb-2">
                  Items
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {s.items.map((i) => (
                    <span
                      key={i.code}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F8F5EF] border border-[#ECE4D4] text-xs"
                    >
                      <span className="font-medium">
                        {i.quantity}×
                      </span>

                      <span className="font-mono text-[#8A8378]">
                        {i.code}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="hidden md:block">
                <p className="font-mono text-sm">
                  {s.totalQuantity}
                </p>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between md:block mb-2 md:mb-0">
                <p className="md:hidden text-[9px] uppercase tracking-widest text-[#8A8378]">
                  Payment
                </p>

                <span className="inline-flex px-2 py-1 rounded-md bg-[#F8F5EF] border border-[#ECE4D4] text-[10px] font-medium capitalize">
                  {s.paymentMethod}
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between md:block mb-2 md:mb-0">
                <p className="md:hidden text-[9px] uppercase tracking-widest text-[#8A8378]">
                  Total
                </p>

                <p className="font-mono text-sm font-semibold text-[#C2703D]">
                  {s.total.toLocaleString()} Br
                </p>
              </div>

              {/* Date */}
              <div className="hidden md:block">
                <p className="text-xs text-[#8A8378]">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Mobile quantity */}
              <div className="flex items-center justify-between md:hidden pt-2 border-t border-[#F0EBE2]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8A8378]">
                    {s.totalQuantity}{" "}
                    {s.totalQuantity === 1 ? "item" : "items"}
                  </span>

                  <span className="text-[#D8CFBB]">•</span>

                  <span className="text-xs capitalize text-[#8A8378]">
                    {s.paymentMethod}
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-widest text-[#C2703D] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View receipt →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}