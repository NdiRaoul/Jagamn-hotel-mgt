export function buildReceiptEmailHtml(data: {
  bookingRef: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;background:#FAFAFA;margin:0;padding:40px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
    <div style="background:#00152A;padding:40px;text-align:center;">
      <h1 style="color:#FFB77A;margin:0;">Jagamn Palace</h1>
      <p style="color:#9ca3af;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Booking Confirmed</p>
    </div>
    <div style="padding:40px;">
      <p>Dear ${data.guestName},</p>
      <div style="background:#F4F6F8;border-radius:8px;padding:24px;margin:24px 0;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#9ca3af;margin:0 0 8px;">Reference</p>
        <p style="font-size:28px;font-weight:bold;color:#00152A;font-family:monospace;margin:0;">${data.bookingRef}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Room</td>
          <td style="text-align:right;font-weight:bold;color:#00152A;">${data.roomName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Check-in</td>
          <td style="text-align:right;font-weight:bold;color:#00152A;">${data.checkIn}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Check-out</td>
          <td style="text-align:right;font-weight:bold;color:#00152A;">${data.checkOut}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Nights × Rate</td>
          <td style="text-align:right;color:#00152A;">$${data.pricePerNight} × ${data.nights} = $${data.pricePerNight * data.nights}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Taxes (10%)</td>
          <td style="text-align:right;color:#00152A;">$${data.taxAmount}</td>
        </tr>
        <tr>
          <td style="padding:14px 0;color:#00152A;font-weight:bold;font-size:16px;">Total Paid</td>
          <td style="text-align:right;font-weight:bold;font-size:16px;color:#00152A;">$${data.totalAmount}</td>
        </tr>
      </table>
    </div>
    <div style="background:#F4F6F8;padding:24px;text-align:center;">
      <p style="color:#9ca3af;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Jagamn Palace · Excellence Since 1892</p>
    </div>
  </div>
</body>
</html>`;
}
