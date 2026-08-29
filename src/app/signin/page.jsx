"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/feed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Izhar</h1>
          <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg color:#F43F5E" style={{ color: "#F43F5E" }} >{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition disabled:opacity-50 mt-1 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          No account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}