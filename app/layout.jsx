import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner.jsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tekel Stok Takip",
  description: "Market Stok Takip Uygulaması",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
