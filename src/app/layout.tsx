import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "אפליקציה דידי · Smart Shopping",
  description: "מערכת מעקב קניות חכמה שלומדת מהיסטוריית הקניות שלך",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <div className="flex-1 pb-28">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
