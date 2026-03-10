import type { Metadata, Viewport } from "next";
import Sidebar from "../components/sidebar";
import { WalletProvider } from "../components/wallet-provider";
import "@rainbow-me/rainbowkit/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { Suspense } from "react";
import NavbarV2 from "../components/navbar-v2";
import { Footer } from "../components/footer";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Peejayy Gaming App",
  description: "Gaming platform built with Next.js",
  icons: {
    icon: "/assets/icon.svg",
    apple: "/assets/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[#1c1c1c] overflow-x-hidden">
      <body className="text-[#ededed] font-inter min-h-dvh min-w-dvw ">
        <Suspense>
          <WalletProvider>
            <div className="flex">
              <div className="wrap relative ">
                <Sidebar />
              </div>
              <div className="content w-[100vw] lg:w-[calc(100vw-220px)] lg:ml-[220px]">
                <div className="">
                  <NavbarV2 />
                  <div className="container mx-auto">{children}</div>
                  <Footer />
                </div>
              </div>
            </div>
          </WalletProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
