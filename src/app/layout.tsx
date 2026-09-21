import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Chola Chela Photography | Premium Photo Books Zambia",
  description:
    "Create and print beautiful custom photo books in Zambia. Upload photos, auto-create books, design and order.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
