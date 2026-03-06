import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Garden of Makers - Your revenue, visualized as a living forest",
  description:
    "Every startup is a tree. MRR determines height. Customers become fruits. Powered by verified revenue data from TrustMRR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${silkscreen.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
