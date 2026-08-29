import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import "./globals.css";

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}