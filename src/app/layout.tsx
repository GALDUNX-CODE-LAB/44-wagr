import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import Sidebar from "../components/sidebar";
import { WalletProvider } from "../components/wallet-provider";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Suspense } from "react";
import NavbarV2 from "../components/navbar-v2";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Peejayy Gaming App",
  description: "Gaming platform built with Next.js",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} bg-[#1c1c1c] overflow-x-hidden`}
    >
      <body className="text-[#ededed] font-inter min-h-dvh min-w-dvw ">
        <Suspense>
          <WalletProvider>
            {/* ✅ Use min-h-dvh to avoid iOS 100vh zoom/resize quirks */}
            <div className="flex">
              <div>
                <Sidebar />
              </div>

              {/* Main content area */}
              <div className="flex-1 flex flex-col lg:ml-[220px]">
                {/* <Navbar /> */}
                <NavbarV2 />
                <main className="flex-1">
                  <div className="container mx-auto">{children}</div>
                </main>
              </div>
            </div>
          </WalletProvider>
        </Suspense>
      </body>
    </html>
  );
}
