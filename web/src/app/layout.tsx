import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { NavBar } from "@/components/layout/nav-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Casbin 权限管理演示",
  description: "展示 NestJS、NextJS 和 Casbin 集成的演示应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
