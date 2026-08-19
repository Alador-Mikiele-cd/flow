import { listSales } from "@/lib/db/sales";
import Link from "next/link";

export default async function ReconciliationPage() {
  const sales = await listSales(500);

  const now = new Date();

  const todaySales = sales.filter((sale) => {
    const date = new Date(sale.createdAt);

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  });

  const totalRevenue = todaySales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const totalReceived = todaySales.reduce(
    (sum, sale) => sum + sale.amountReceived,
    0
  );

  const totalChange = todaySales.reduce(
    (sum, sale) => sum + sale.change,
    0
  );

  const difference = totalReceived - totalRevenue;

  const paymentTotals = {
    cash: {
      amount: 0,
      sales: 0,
    },
    telebirr: {
      amount: 0,
      sales: 0,
    },
    bank: {
      amount: 0,
      sales: 0,
    },
  };

  todaySales.forEach((sale) => {
    paymentTotals[sale.paymentMethod].amount += sale.amountReceived;
    paymentTotals[sale.paymentMethod].sales += 1;
  });

  const isBalanced = difference === totalChange;

  return (
    <div className="min-w-0 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C2703D] font-semibold mb-2">
            Financial Control
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Reconciliation
          </h1>

          <p className="text-[#8A8378] text-sm">
            Check today's payments against recorded sales.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-1">
            Today
          </p>

          <p className="font-serif text-xl font-bold">
            {now.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <a
  href="/api/recolciliation/export"
  className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
>
  ↓ Download Excel
</a>
      </div>

      {/* MAIN STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* REVENUE */}
        <div className="bg-white border border-[#ECE4D4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(60,45,30,0.03)]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378]">
              Total Revenue
            </p>

            <div className="w-8 h-8 rounded-lg bg-[#FBF4E8] flex items-center justify-center text-[#C2703D]">
              Br
            </div>
          </div>

          <p className="font-serif text-2xl font-bold">
            {totalRevenue.toLocaleString()}{" "}
            <span className="text-sm font-normal text-[#8A8378]">
              Br
            </span>
          </p>

          <p className="text-xs text-[#8A8378] mt-2">
            {todaySales.length}{" "}
            {todaySales.length === 1 ? "transaction" : "transactions"}
          </p>
        </div>

        {/* RECEIVED */}
        <div className="bg-white border border-[#ECE4D4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(60,45,30,0.03)]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378]">
              Money Received
            </p>

            <div className="w-8 h-8 rounded-lg bg-[#F2F7F3] flex items-center justify-center text-[#1F5D3A]">
              ✓
            </div>
          </div>

          <p className="font-serif text-2xl font-bold">
            {totalReceived.toLocaleString()}{" "}
            <span className="text-sm font-normal text-[#8A8378]">
              Br
            </span>
          </p>

          <p className="text-xs text-[#8A8378] mt-2">
            Including customer change
          </p>
        </div>

        {/* CHANGE */}
        <div className="bg-white border border-[#ECE4D4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(60,45,30,0.03)]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378]">
              Change Given
            </p>

            <div className="w-8 h-8 rounded-lg bg-[#FBF4E8] flex items-center justify-center text-[#C2703D]">
              ↩
            </div>
          </div>

          <p className="font-serif text-2xl font-bold">
            {totalChange.toLocaleString()}{" "}
            <span className="text-sm font-normal text-[#8A8378]">
              Br
            </span>
          </p>

          <p className="text-xs text-[#8A8378] mt-2">
            Returned to customers
          </p>
        </div>
      </div>

      {/* BALANCE STATUS */}
      <div
        className={
          "rounded-2xl border p-6 mb-5 " +
          (isBalanced
            ? "bg-[#F4F8F5] border-[#D8E8DC]"
            : "bg-[#FFF7F5] border-[#F0D8D2]")
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              className={
                "w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold " +
                (isBalanced
                  ? "bg-[#DCEDE1] text-[#1F5D3A]"
                  : "bg-[#F4DAD5] text-[#C0392B]")
              }
            >
              {isBalanced ? "✓" : "!"}
            </div>

            <div>
              <p
                className={
                  "font-serif text-lg font-bold " +
                  (isBalanced
                    ? "text-[#1F5D3A]"
                    : "text-[#C0392B]")
                }
              >
                {isBalanced ? "Day is balanced" : "Check required"}
              </p>

              <p className="text-xs text-[#8A8378] mt-1">
                {isBalanced
                  ? "All recorded payments are accounted for."
                  : "There is a difference that needs attention."}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8378] mb-1">
              Difference
            </p>

            <p
              className={
                "font-mono text-xl font-bold " +
                (isBalanced
                  ? "text-[#1F5D3A]"
                  : "text-[#C0392B]")
              }
            >
              {difference.toLocaleString()} Br
            </p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHODS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PaymentCard
          title="Cash"
          amount={paymentTotals.cash.amount}
          sales={paymentTotals.cash.sales}
          symbol="₿"
        />

        <PaymentCard
          title="Telebirr"
          amount={paymentTotals.telebirr.amount}
          sales={paymentTotals.telebirr.sales}
          symbol="T"
        />

        <PaymentCard
          title="Bank"
          amount={paymentTotals.bank.amount}
          sales={paymentTotals.bank.sales}
          symbol="B"
        />
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white border border-[#ECE4D4] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(60,45,30,0.03)]">
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-[#ECE4D4]">
          <div>
            <h2 className="font-serif text-lg font-bold">
              Today's Transactions
            </h2>

            <p className="text-xs text-[#8A8378] mt-1">
              Every payment recorded today.
            </p>
          </div>

          <Link
            href="/dashboard/sales"
            className="text-[10px] uppercase tracking-widest font-semibold text-[#C2703D] hover:text-[#A85F32]"
          >
            All sales →
          </Link>
        </div>

        {todaySales.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FBF4E8] flex items-center justify-center text-[#B8AF9E]">
              —
            </div>

            <p className="text-sm font-medium">
              No transactions today
            </p>

            <p className="text-xs text-[#8A8378] mt-1">
              Completed sales will appear here.
            </p>
          </div>
        ) : (
          <div>
            {todaySales.map((sale) => (
              <Link
                key={sale._id}
                href={`/dashboard/sales/${sale._id}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#F0EBE2] last:border-b-0 hover:bg-[#FFFCF7] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FBF4E8] flex items-center justify-center text-[10px] font-bold text-[#C2703D]">
                    {sale.paymentMethod === "cash"
                      ? "C"
                      : sale.paymentMethod === "telebirr"
                      ? "T"
                      : "B"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold">
                        #{sale.receiptNumber}
                      </span>

                      <span className="text-[9px] uppercase tracking-wider text-[#8A8378]">
                        {sale.paymentMethod}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#8A8378] mt-1">
                      {new Date(sale.createdAt).toLocaleTimeString()}{" "}
                      · {sale.totalQuantity} sireys
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="font-mono text-sm font-semibold text-[#C2703D]">
                    {sale.total.toLocaleString()} Br
                  </p>

                  <p className="text-[10px] text-[#8A8378] mt-1">
                    Received {sale.amountReceived.toLocaleString()} Br
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- */
/* PAYMENT CARD                     */
/* -------------------------------- */

function PaymentCard({
  title,
  amount,
  sales,
  symbol,
}: {
  title: string;
  amount: number;
  sales: number;
  symbol: string;
}) {
  return (
    <div className="bg-white border border-[#ECE4D4] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] uppercase tracking-widest text-[#8A8378]">
          {title}
        </p>

        <div className="w-8 h-8 rounded-lg bg-[#FBF4E8] flex items-center justify-center text-xs font-bold text-[#C2703D]">
          {symbol}
        </div>
      </div>

      <p className="font-serif text-xl font-bold">
        {amount.toLocaleString()} Br
      </p>

      <p className="text-xs text-[#8A8378] mt-2">
        {sales} {sales === 1 ? "sale" : "sales"}
      </p>
    </div>
  );
}