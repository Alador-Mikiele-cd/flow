"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

const navItems = [
  {
    href: "/dashboard",
    label: "Command Center",
    icon: Icon.command,
  },
  {
    href: "/dashboard/sales",
    label: "Sell",
    icon: Icon.sales,
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Icon.inventory,
  },
  {
    href: "/dashboard/sales/history",
    label: "Receipts",
    icon: Icon.receipts,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: Icon.reports,
  },
  {
    href: "/dashboard/reconciliation",
    label: "Reconciliation",
    icon: Icon.reconciliation,
  },
  {
    href: "/dashboard/activity",
    label: "Activity",
    icon: Icon.activity,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Icon.notifications,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* ============================= */}
      {/* DESKTOP SIDEBAR NAV */}
      {/* ============================= */}

      <nav className="hidden md:flex flex-1 px-3 mt-2 flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors " +
                (active
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#5A5347] hover:bg-[#FBF4E8] hover:text-[#1A1A1A]")
              }
            >
              <span className="[&>svg]:w-[16px] [&>svg]:h-[16px] shrink-0">
                {item.icon}
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ============================= */}
      {/* MOBILE HAMBURGER */}
      {/* ============================= */}

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-[#FBF4E8] transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-6 h-6"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        {/* ============================= */}
        {/* DARK BACKDROP */}
        {/* ============================= */}

        {open && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/30 z-[90]"
          />
        )}

        {/* ============================= */}
        {/* MOBILE DRAWER */}
        {/* ============================= */}

        <aside
          className={
            "fixed left-0 top-0 h-screen w-1/2 min-w-[240px] max-w-[340px] bg-white z-[100] shadow-2xl flex flex-col transition-transform duration-300 ease-out " +
            (open ? "translate-x-0" : "-translate-x-full")
          }
        >
          {/* DRAWER HEADER */}

          <div className="h-16 px-4 flex items-center justify-between border-b border-[#ECE4D4] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#1A1A1A] flex items-center justify-center text-white font-serif font-semibold text-sm">
                ስ
              </div>

              <span className="font-serif font-bold text-lg tracking-tight">
                SireyFlow
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-[#FBF4E8]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-5 h-5"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      "flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors " +
                      (active
                        ? "bg-[#1A1A1A] text-white"
                        : "text-[#5A5347] hover:bg-[#FBF4E8] hover:text-[#1A1A1A]")
                    }
                  >
                    <span className="[&>svg]:w-[18px] [&>svg]:h-[18px] shrink-0">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* MOBILE BOTTOM */}

          <div className="border-t border-[#ECE4D4] p-4 shrink-0">
            <p className="text-[10px] text-[#8A8378]">
              Flow
            </p>

            <p className="text-xs text-[#5A5347] mt-1">
              Inventory & Sales
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}