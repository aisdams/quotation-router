import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exim || Export Import",
  description: "Export Import",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    {children}
  );
}
