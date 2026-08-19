"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF4E8] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-md bg-[#1A1A1A] flex items-center justify-center text-white font-serif font-semibold text-lg mb-4">
            ስ
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Flow</h1>
          <p className="text-[#8A8378] text-xs mt-1 tracking-wide uppercase">Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#ECE4D4] rounded-xl p-8 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A8378] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#ECE4D4] rounded-md px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A8378] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#ECE4D4] rounded-md px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[#C0392B] text-xs font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#1A1A1A] text-white text-sm font-medium tracking-wide py-2.5 rounded-md hover:bg-[#333] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
