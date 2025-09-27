import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบจัดการร้านเย็บผ้า",
  description: "ระบบจัดการร้านเย็บผ้าออนไลน์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="grow">
              {children}
            </div>
            <footer className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white py-4 sm:py-6 mt-auto">
              <div className="container mx-auto px-4 text-center">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <p className="text-base sm:text-lg font-medium flex items-center">
                    <span className="mr-2">✂️</span> ระบบจัดการร้านเย็บผ้า
                  </p>
                  <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()}</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
