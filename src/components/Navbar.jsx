"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
// import { useTheme } from "./ThemeProvider";
import dynamic from "next/dynamic";

const ThemeButton = dynamic(() => import("./ThemeButton"), {
  ssr: false,
});

export default function Navbar({ currentUser }) {
  // const { theme, toggleTheme } = useTheme();


  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="font-bold text-lg tracking-tight text-primary">
          Izhar
        </Link>
        <div className="flex items-center gap-3">
          <ThemeButton />
          <Link
            href={`/profile/${currentUser.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #0D9488, #0369A1)" }}>
              {currentUser.name[0]}
            </div>
            <span className="hidden sm:inline">{currentUser.name}</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}