import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderSelector } from "@/components/layout/header-selector";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RARESIDENCE",
  description:
    "RARESIDENCE is a property management web application that allows users to view and manage their properties, units, and tenants. It provides a user-friendly interface for property managers to efficiently handle their rental properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`} suppressHydrationWarning>
        <HeaderSelector />
        {children}
      </body>
    </html>
  );
}
