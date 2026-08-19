import { listDesigns } from "@/lib/db/designs";
import SellForm from "@/components/SellForm";
import { auth } from "@/auth";

export default async function SellPage() {
  const designs = await listDesigns();
  const session = await auth();

  const staffName =
    session?.user?.name ||
    session?.user?.email ||
    "Admin";

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">
        Point of Sale
      </p>

      <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">
        Make a Sale
      </h1>

      <p className="text-[#8A8378] text-sm mb-6">
        Search designs and build the order.
      </p>

      <SellForm
        designs={designs}
        staffName={staffName}
      />
    </div>
  );
}