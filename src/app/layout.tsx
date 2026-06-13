import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Normie Genome",
  description: "A biopunk genome atlas for 10,000 on-chain Normies."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
