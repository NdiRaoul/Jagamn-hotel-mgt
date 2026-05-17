import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jagamn Hotel Palace",
  description:
    "Jagamn Hotel Palace is a luxurious hotel, offering exceptional service and amenities to its guests. With elegant rooms, fine dining options, and a range of recreational facilities, Jagamn Hotel Palace is the perfect choice for both business and leisure travelers.",
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
      </body>
    </html>
  );
}
