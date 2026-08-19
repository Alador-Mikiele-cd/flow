import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import SidebarNav from "@/components/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#FBF4E8] text-[#1A1A1A]">

      {/* ================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================= */}

      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-[#ECE4D4] flex-col z-40">

        {/* LOGO */}

        <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
          <div className="w-8 h-8 rounded-md bg-[#1A1A1A] flex items-center justify-center text-white font-serif font-semibold text-sm">
            ስ
          </div>

          <span className="font-serif font-bold text-lg tracking-tight">
            SireyFlow
          </span>
        </div>

        {/* DESKTOP NAV */}

        <SidebarNav />

        {/* USER */}

        <div className="p-3 border-t border-[#ECE4D4]">
          <div className="flex items-center gap-2.5 px-2 py-2">

            <div className="w-8 h-8 rounded-full bg-[#C2703D] text-white flex items-center justify-center text-xs font-semibold">
              {(session.user.name || session.user.email || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {session.user.name || "Admin"}
              </div>

              <div className="text-[10px] text-[#8A8378]">
                Admin
              </div>
            </div>

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/login",
                });
              }}
            >
              <button
                type="submit"
                className="text-[#8A8378] hover:text-[#1A1A1A] [&>svg]:w-4 [&>svg]:h-4"
                title="Sign out"
              >
                {Icon.signOut}
              </button>
            </form>

          </div>
        </div>
      </aside>

      {/* ================================= */}
      {/* MOBILE TOP BAR */}
      {/* ================================= */}

      <header className="md:hidden h-16 bg-white border-b border-[#ECE4D4] flex items-center justify-between px-4 sticky top-0 z-50">

        <div className="flex items-center gap-2.5">

          <div className="w-8 h-8 rounded-md bg-[#1A1A1A] flex items-center justify-center text-white font-serif font-semibold text-sm">
            ስ
          </div>

          <span className="font-serif font-bold text-lg tracking-tight">
            SireyFlow
          </span>

        </div>

        {/* HAMBURGER */}

        <SidebarNav />

      </header>

      {/* ================================= */}
      {/* MAIN */}
      {/* ================================= */}

      <div className="md:ml-56 min-h-screen">

        <main className="px-4 sm:px-6 md:px-10 py-5 md:py-8 max-w-[1400px]">
          {children}
        </main>

      </div>

    </div>
  );
}