import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "สมุดบันทึกรายรับ-รายจ่าย",
  description: "บันทึกรายรับ-รายจ่ายส่วนตัว ใช้งานได้ทั้งบน Web, iPhone, iPad ซิงค์อัตโนมัติ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "รายรับรายจ่าย",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 sm:pb-8">
        {children}
      </body>
    </html>
  );
}
