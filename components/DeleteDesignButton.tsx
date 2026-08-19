"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDesignButton({
  designId,
  designName,
}: {
  designId: string;
  designName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
  const confirmed = window.confirm(
    `Delete "${designName}"?\n\nThis will remove the design from inventory.`
  );

  if (!confirmed) return;

  setLoading(true);

  try {
    const res = await fetch(`/api/designs/${designId}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || `Failed to delete design (${res.status})`);
      return;
    }

    router.push("/dashboard/inventory");
    router.refresh();
  } catch (error) {
    console.error(error);
    alert("Something went wrong while deleting the design.");
  } finally {
    setLoading(false);
  }
}

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2.5 rounded-md border border-[#E5B8B4] text-[#C0392B] text-xs font-medium hover:bg-[#FDEDED] transition-colors disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}