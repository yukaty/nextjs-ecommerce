import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAuthUser } from "@/lib/auth";
import { CartProvider } from "@/hooks/useCart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAPLE Store",
  description: "We deliver the latest trendy items.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get authenticated user information
  const user = await getAuthUser();

  return (
    <html lang="en" suppressContentEditableWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <Header user={user} />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
