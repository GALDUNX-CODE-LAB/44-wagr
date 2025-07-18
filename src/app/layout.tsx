import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { WalletProvider } from "../components/wallet-provider";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const inter = Inter({
  weight: ["500"],
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peejayy Gaming App",
  description: "Gaming platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#1c1c1c]">
      <body
        className={` ${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased   text-[#ededed] font-inter min-h-screen`}
      >
        <WalletProvider>
  <div className="flex h-screen">
    
    <div className="">
      <Sidebar />
    </div>

    {/* Main content area */}
    <div className="flex-1 flex flex-col lg:ml-[245px]">
      <Navbar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  </div>
</WalletProvider>

      </body>
    </html>
  );
}
