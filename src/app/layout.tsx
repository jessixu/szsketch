import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "印刻奇旅 · 版画创意智造工坊",
  description: "版画创意智造与传统纹样生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
