import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Jagamn Hotel Palace",
  description:
    "Jagamn Hotel Palace is a luxurious hotel, offering exceptional service and amenities to its guests. With elegant rooms, fine dining options, and a range of recreational facilities, Jagamn Hotel Palace is the perfect choice for both business and leisure travelers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D2137", // Jagamn primary color
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-manrope"
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
