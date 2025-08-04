import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";



export const metadata: Metadata = {
  title: "Argumint",
  description: "A platform for engaging debates and discussions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}