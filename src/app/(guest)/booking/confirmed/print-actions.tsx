"use client";

import { Download } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export interface ReceiptData {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestCountry: string | null;
  roomName: string;
  checkIn: string; // pre-formatted e.g. "May 12, 2025"
  checkOut: string;
  nights: number;
  guestCount: number;
  roomPricePerNight: number;
  roomTotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  issuedAt: string; // pre-formatted date
}

function generateReceiptPDF(data: ReceiptData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  const navy = [0, 21, 42] as const;
  const gold = [186, 114, 46] as const;
  const lightGray = [245, 245, 245] as const;
  const midGray = [120, 120, 120] as const;

  let y = 0;

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 80, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("JAGAMN PALACE", 40, 38);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Lake Pichola, Rajasthan  •  reservations@jagamnpalace.com", 40, 56);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(186, 114, 46);
  doc.text("BOOKING RECEIPT", W - 40, 38, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(`Issued: ${data.issuedAt}`, W - 40, 56, { align: "right" });

  y = 100;

  // ── Booking reference pill ───────────────────────────────────────────────
  doc.setFillColor(...lightGray);
  doc.roundedRect(40, y, W - 80, 44, 4, 4, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...midGray);
  doc.text("BOOKING REFERENCE", 56, y + 16);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text(data.bookingRef, 56, y + 36);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...midGray);
  doc.text(`Status: ${data.paymentStatus.toUpperCase()}`, W - 56, y + 26, {
    align: "right",
  });

  y += 64;

  // ── Section helper ───────────────────────────────────────────────────────
  const sectionTitle = (title: string) => {
    doc.setFillColor(...gold);
    doc.rect(40, y, 3, 14, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navy);
    doc.text(title, 50, y + 11);
    y += 24;
  };

  const row = (label: string, value: string, bold = false) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...midGray);
    doc.text(label, 56, y);
    doc.setTextColor(...navy);
    doc.text(value, W - 56, y, { align: "right" });
    y += 18;
  };

  const divider = () => {
    doc.setDrawColor(230, 230, 230);
    doc.line(40, y, W - 40, y);
    y += 14;
  };

  // ── Guest Details ────────────────────────────────────────────────────────
  sectionTitle("GUEST DETAILS");

  row("Full Name", data.guestName);
  row("Email", data.guestEmail);
  if (data.guestPhone) row("Phone", data.guestPhone);
  if (data.guestCountry) row("Country", data.guestCountry);

  y += 8;
  divider();

  // ── Room & Stay ──────────────────────────────────────────────────────────
  sectionTitle("ROOM & STAY");

  row("Room", data.roomName);
  row("Check-in", `${data.checkIn}  (from 3:00 PM)`);
  row("Check-out", `${data.checkOut}  (by 12:00 PM)`);
  row("Duration", `${data.nights} night${data.nights !== 1 ? "s" : ""}`);
  row("Guests", `${data.guestCount} guest${data.guestCount !== 1 ? "s" : ""}`);

  y += 8;
  divider();

  // ── Payment Breakdown ────────────────────────────────────────────────────
  sectionTitle("PAYMENT BREAKDOWN");

  row(
    `${data.roomName} × ${data.nights} night${data.nights !== 1 ? "s" : ""}`,
    `${formatMoney(data.roomTotal)}`,
  );
  row("Taxes (10%)", `${formatMoney(data.taxAmount)}`);

  y += 4;

  // Total row
  doc.setFillColor(...navy);
  doc.rect(40, y, W - 80, 36, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 180, 180);
  doc.text("TOTAL PAID", 56, y + 14);

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${formatMoney(data.totalAmount)}`, W - 56, y + 22, {
    align: "right",
  });

  y += 52;

  if (data.paymentMethod) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...midGray);
    doc.text(`Payment via: ${data.paymentMethod}`, 56, y);
    y += 20;
  }

  y += 8;
  divider();

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...midGray);
  doc.text(
    "Thank you for choosing Jagamn Palace. Please present this receipt and a valid government-issued ID at check-in.",
    W / 2,
    y + 10,
    { align: "center", maxWidth: W - 80 },
  );

  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text("Jagamn Palace  •  Excellence since 1892", W / 2, y + 28, {
    align: "center",
  });

  // ── Save ─────────────────────────────────────────────────────────────────
  doc.save(`Jagamn-Receipt-${data.bookingRef}.pdf`);
}

export function DownloadReceiptButton({ receipt }: { receipt: ReceiptData }) {
  return (
    <Button
      variant="outline"
      className="border-[#00152A] text-[#00152A] h-12 px-8 flex items-center gap-2 hover:bg-gray-50"
      onClick={() => generateReceiptPDF(receipt)}
    >
      <Download className="w-4 h-4" />
      Download Receipt
    </Button>
  );
}
