import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "深中高中园版画素材助手",
  description: "传统纹样与版画设计生成工具",
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
