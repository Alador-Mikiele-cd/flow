"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm font-medium border border-[#ECE4D4] rounded-md px-5 py-2.5 hover:bg-[#FBF4E8] transition-colors"
    >
      Print
    </button>
  );
}
