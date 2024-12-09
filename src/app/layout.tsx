import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Character Selection",
  description: "Interactive character selection interface",
};

export default function RootLayout({
  children,
}: Readonly) {
  return (
    
      {children}
    
  );
}
