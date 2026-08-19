import { listDesigns } from "@/lib/db/designs";
import AddDesignForm from "@/components/AddDesignForm";
import InventoryGrid from "@/components/InventoryGrid";

export default async function InventoryPage() {
  const designs = await listDesigns();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">Catalog</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">Inventory</h1>
          <p className="text-[#8A8378] text-sm">Manage your Sirey designs and stock.</p>
        </div>
        <AddDesignForm />
      </div>

      <InventoryGrid designs={designs} />
    </div>
  );
}
