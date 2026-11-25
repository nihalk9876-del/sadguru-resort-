import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor, registerPlugin } from '@capacitor/core';

export const WhatsAppDirectShare = registerPlugin('WhatsAppDirectShare');

export const OWNER_PHONE = '8001800146';
export const OWNER_NAME = 'Rushikesh Rohankar';
export const RESORT_OFFICIAL_ADDRESS = 'QP9F+QGV, Nagzari Rd, Mahatma Jyotiba Phule Nagar, Shegaon, Maharashtra 444203';
export const RESORT_WEBSITE_URL = 'https://sadguru-resort-frontend.vercel.app/';

/**
 * Formats a short details message with "Visit again"
 */
export function formatShortWhatsAppMessage(booking) {
  const isCouple = booking.stayType === 'Couple' || Boolean(booking.secondGuestName);
  const lines = [
    '🏨 *Shri Sadguru Resort - Booking Confirmation*',
    '━━━━━━━━━━━━━━━━━━━━━',
    `*Booking ID:* ${booking.id || 'N/A'}`,
    `*Guest:* ${booking.customerName || 'N/A'}`,
    booking.secondGuestName ? `*Partner:* ${booking.secondGuestName}${booking.secondGuestAge ? ` (${booking.secondGuestAge} Yrs)` : ''}` : null,
    `*Room:* Room ${booking.roomNumber || 'Assigned'} (${booking.category || 'Deluxe AC'})`,
    `*Check-in:* ${booking.checkIn || 'Today'} (${booking.checkInTime || '12:00 PM'})`,
    `*Check-out:* ${booking.checkOut || 'Tomorrow'} (${booking.checkOutTime || '11:00 AM'})`,
    `*Stay Type:* ${booking.stayType || (isCouple ? 'Couple' : 'Family')}`,
    `*Total Amount:* ₹${(booking.totalAmount || 0).toLocaleString('en-IN')} (Paid)`,
    '━━━━━━━━━━━━━━━━━━━━━',
    `📍 *Address:* ${RESORT_OFFICIAL_ADDRESS}`,
    `📞 *Contact:* ${OWNER_NAME} - ${OWNER_PHONE}`,
    `🌐 ${RESORT_WEBSITE_URL}`,
    '',
    '🙏 *Thank you for staying with us. Visit again!*'
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Generates an ultra-crisp, high-resolution graphic bill image (1000 x 1420 px)
 * using HTML5 Canvas 2D API.
 */
export async function generateBillCanvas(booking) {
  const width = 1000;
  const height = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background - Crisp warm white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer Gold Border & Shadow Margin
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // 1. Header Banner
  const headerHeight = 150;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(26, 26, width - 52, headerHeight);

  // Gold accent line under header
  ctx.fillStyle = '#C5A059';
  ctx.fillRect(26, 26 + headerHeight, width - 52, 6);

  // Resort Title
  ctx.fillStyle = '#DFB06C';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ SHRI SADGURU RESORT ★', width / 2, 75);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 16px sans-serif';
  ctx.fillText('LUXURY LIVING & SERENE TRANQUILITY • SHEGAON, MAHARASHTRA', width / 2, 108);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '13px monospace';
  ctx.fillText(`Contact: ${OWNER_NAME} - ${OWNER_PHONE} | Web: ${RESORT_WEBSITE_URL}`, width / 2, 134);

  // 2. Receipt Badge
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('OFFICIAL ROOM ALLOTMENT & RECEIPT BILL', width / 2, 218);

  ctx.fillStyle = '#64748B';
  ctx.font = '14px sans-serif';
  const genDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  ctx.fillText(`Generated on: ${genDate}`, width / 2, 244);

  // Booking Reference Pill
  const pillW = 420;
  const pillH = 36;
  const pillX = (width - pillW) / 2;
  const pillY = 262;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(pillX, pillY, pillW, pillH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(pillX, pillY, pillW, pillH);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`BOOKING REF: ${booking.id || 'SR-SPOT-NEW'}`, width / 2, pillY + 24);

  // Helper box drawer
  const drawCard = (x, y, w, h, title, icon = '•') => {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Title bar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x, y, w, 36);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${icon} ${title}`, x + 16, y + 24);
  };

  const drawRow = (x, y, label, value, isBold = false, isAccent = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText(label, x, y);

    ctx.textAlign = 'right';
    if (isAccent) ctx.fillStyle = '#B45309';
    else if (isBold) ctx.fillStyle = '#0F172A';
    else ctx.fillStyle = '#1E293B';
    ctx.font = isBold ? 'bold 15px sans-serif' : '14px sans-serif';
    ctx.fillText(String(value || '-'), x + 400, y);
  };

  // 3. Section: Guest Identification
  const leftX = 60;
  const rightX = 520;
  const cardW = 420;
  const guestCardH = 240;
  const guestCardY = 320;

  drawCard(leftX, guestCardY, cardW, guestCardH, 'GUEST IDENTIFICATION', '👤');
  let rowY = guestCardY + 68;
  drawRow(leftX + 16, rowY, 'Stay Category:', booking.stayType || 'Family', true, true);
  rowY += 32;
  drawRow(leftX + 16, rowY, 'Primary Guest:', booking.customerName || 'Guest', true);
  rowY += 32;
  drawRow(leftX + 16, rowY, 'Mobile Contact:', booking.phone || '-', false);
  rowY += 32;
  drawRow(leftX + 16, rowY, 'Aadhaar ID:', booking.aadhaarNumber ? `${booking.aadhaarNumber} (Verified ✓)` : 'Direct Check-In', false);
  if (booking.secondGuestName) {
    rowY += 32;
    drawRow(leftX + 16, rowY, 'Partner / Guest 2:', `${booking.secondGuestName} (${booking.secondGuestAge || ''} Yrs)`, true);
  } else {
    rowY += 32;
    drawRow(leftX + 16, rowY, 'Occupancy:', `${booking.adults || booking.guests || 2} Adults`, false);
  }

  // 4. Section: Room & Allotment Details
  drawCard(rightX, guestCardY, cardW, guestCardH, 'ROOM & ALLOTMENT DETAILS', '🛏️');
  rowY = guestCardY + 68;
  drawRow(rightX + 16, rowY, 'Room Number:', `Room ${booking.roomNumber || 'Assigned'}`, true, true);
  rowY += 32;
  drawRow(rightX + 16, rowY, 'Room Category:', booking.category || 'Deluxe AC', false);
  rowY += 32;
  drawRow(rightX + 16, rowY, 'Check-In Time:', `${booking.checkIn || 'Today'} (${booking.checkInTime || '12:00 PM'})`, false);
  rowY += 32;
  drawRow(rightX + 16, rowY, 'Occupied Till:', `${booking.checkOut || 'Tomorrow'} (${booking.checkOutTime || '11:00 AM'})`, true);
  rowY += 32;
  drawRow(rightX + 16, rowY, 'Duration:', booking.durationHours ? `${booking.durationHours} Hours (1 Night)` : '24 Hours', false);

  // 5. Section: Financial & Billing Summary
  const billCardY = 585;
  const billCardH = 260;
  const fullCardW = width - 120;

  drawCard(leftX, billCardY, fullCardW, billCardH, 'PAYMENT & BILLING SUMMARY', '💳');

  // Table Header
  const tableY = billCardY + 68;
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(leftX + 16, tableY, fullCardW - 32, 34);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DESCRIPTION', leftX + 32, tableY + 22);
  ctx.textAlign = 'center';
  ctx.fillText('RATE / NIGHT', leftX + 460, tableY + 22);
  ctx.textAlign = 'center';
  ctx.fillText('DURATION', leftX + 660, tableY + 22);
  ctx.textAlign = 'right';
  ctx.fillText('TOTAL (INR)', leftX + fullCardW - 48, tableY + 22);

  // Table Row 1
  const row1Y = tableY + 62;
  ctx.fillStyle = '#0F172A';
  ctx.font = '500 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Room Allotment (${booking.category || 'Deluxe Room'} - Room ${booking.roomNumber || ''})`, leftX + 32, row1Y);
  ctx.textAlign = 'center';
  ctx.fillText(`₹${(Number(booking.rate) || Number(booking.totalAmount) || 0).toLocaleString('en-IN')}`, leftX + 460, row1Y);
  ctx.fillText(`${booking.durationHours ? `${booking.durationHours} hrs` : '1 Night'}`, leftX + 660, row1Y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`, leftX + fullCardW - 48, row1Y);

  // Divider line
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftX + 16, row1Y + 20);
  ctx.lineTo(leftX + fullCardW - 16, row1Y + 20);
  ctx.stroke();

  // Financial totals breakdown
  const summaryY = row1Y + 52;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'right';
  ctx.fillText('Total Payable Amount:', leftX + fullCardW - 180, summaryY);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`, leftX + fullCardW - 48, summaryY);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Amount Received (${booking.paymentMethod || 'Cash'}):`, leftX + fullCardW - 180, summaryY + 30);
  ctx.fillStyle = '#15803D';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`₹${(booking.advancePaid || booking.totalAmount || 0).toLocaleString('en-IN')}`, leftX + fullCardW - 48, summaryY + 30);

  // Stamp: "PAID & CONFIRMED"
  ctx.save();
  ctx.translate(leftX + 160, summaryY + 12);
  ctx.rotate(-0.1);
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 3;
  ctx.strokeRect(-90, -22, 180, 44);
  ctx.fillStyle = '#16A34A';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAID & CONFIRMED ✓', 0, 6);
  ctx.restore();

  // 6. Section: Resort Policies & Rules Box
  const infoBoxY = 875;
  const infoBoxH = 160;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(leftX, infoBoxY, fullCardW, infoBoxH);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(leftX, infoBoxY, fullCardW, infoBoxH);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📋 RESORT STAY POLICIES & GUIDELINES', leftX + 24, infoBoxY + 32);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('• Standard Check-out time is strictly 11:00 AM unless approved for extension by the front desk.', leftX + 24, infoBoxY + 62);
  ctx.fillText('• Valid government-issued photo ID is retained for compliance with hospitality regulations.', leftX + 24, infoBoxY + 86);
  ctx.fillText('• Room key must be surrendered at the front desk upon checkout. Room damage is subject to fine.', leftX + 24, infoBoxY + 110);
  ctx.fillText('• 24x7 Front Desk & Room Assistance available. Please feel free to reach our staff anytime.', leftX + 24, infoBoxY + 134);

  // 7. Footer: Official Address & Contact
  const footerY = 1065;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(26, footerY, width - 52, 230);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, footerY, width - 52, 230);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHRI SADGURU RESORT & HOTEL', width / 2, footerY + 36);

  ctx.fillStyle = '#334155';
  ctx.font = '13.5px sans-serif';
  ctx.fillText(`📍 Address: ${RESORT_OFFICIAL_ADDRESS}`, width / 2, footerY + 66);
  ctx.fillText(`📞 Contact / Manager: ${OWNER_NAME} (${OWNER_PHONE})`, width / 2, footerY + 92);
  ctx.fillText(`🌐 Website: ${RESORT_WEBSITE_URL}`, width / 2, footerY + 118);

  // Warm Visit Again Banner
  const visitBoxW = width - 120;
  const visitBoxH = 50;
  const visitBoxX = 60;
  const visitBoxY = footerY + 150;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(visitBoxX, visitBoxY, visitBoxW, visitBoxH);

  ctx.fillStyle = '#DFB06C';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🙏 Thank you for choosing Shri Sadguru Resort! Visit again.', width / 2, visitBoxY + 32);

  // Bottom micro watermark
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Authorized Computer-Generated Invoice • No Physical Signature Required', width / 2, height - 38);

  return canvas;
}

/**
 * Downloads or saves the bill image directly as a PNG file.
 */
export async function downloadBillImage(booking) {
  const canvas = await generateBillCanvas(booking);
  const dataUrl = canvas.toDataURL('image/png');
  const fileName = `Sadguru_Bill_${booking.id || Date.now()}.png`;

  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = dataUrl.split(',')[1];
      const saved = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents
      });
      alert(`Bill image saved successfully to device files!\n${fileName}`);
      return saved;
    } catch (e) {
      console.warn('Native save fallback to cache:', e);
    }
  }

  // Web Browser fallback
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Shares the Bill Image + Short WhatsApp Message to Customer or Owner.
 * On Native (Android): uses Capacitor Share to send the image file AND message text.
 * On Web: downloads the image and opens wa.me with the message text.
 */
export async function shareBillImageWithWhatsApp(booking, targetPhone = null, isOwner = false) {
  const rawPhone = targetPhone || (isOwner ? OWNER_PHONE : booking.phone) || '';
  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const shortText = formatShortWhatsAppMessage(booking);

  // 1. Generate Bill Image
  const canvas = await generateBillCanvas(booking);
  const dataUrl = canvas.toDataURL('image/png');
  const base64Data = dataUrl.split(',')[1];
  const fileName = `Sadguru_Bill_${booking.id || Date.now()}.png`;

  // 2. Mobile Native Capacitor Sharing (Directly targets the recipient chat so number is ALREADY SELECTED)
  if (Capacitor.isNativePlatform()) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // DIRECT CHAT SEND: directly opens the exact customer or owner chat with the image + text attached
      await WhatsAppDirectShare.shareToChat({
        phone: formattedPhone,
        message: shortText,
        filePath: savedFile.uri
      });

      return { success: true, native: true };
    } catch (pluginErr) {
      console.warn('WhatsAppDirectShare plugin notice, falling back to Share.share:', pluginErr);
      try {
        const savedFile = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache
        });
        await Share.share({
          title: 'Shri Sadguru Resort - Booking Bill',
          text: shortText,
          files: [savedFile.uri],
          dialogTitle: isOwner ? `Send Bill to Owner (${OWNER_NAME}: ${OWNER_PHONE})` : `Send Bill to Customer (${cleanPhone})`
        });
        return { success: true, native: true };
      } catch (shareErr) {
        console.warn('Share.share fallback notice:', shareErr);
      }
    }
  }

  // 3. Desktop / Web Fallback: download bill image and open WhatsApp
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {}

  if (formattedPhone) {
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(shortText)}`;
    window.open(waUrl, '_blank');
  } else {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shortText)}`;
    window.open(waUrl, '_blank');
  }

  return { success: true };
}
