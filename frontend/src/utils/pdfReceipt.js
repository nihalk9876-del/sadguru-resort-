import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const OWNER_PHONE = '8001800146';
export const OWNER_NAME = 'Rushikesh Rohankar';
export const RESORT_OFFICIAL_ADDRESS = 'QP9F+QGV, Nagzari Rd, Mahatma Jyotiba Phule Nagar, Shegaon, Maharashtra 444203';
export const RESORT_WEBSITE_URL = 'https://sadguru-resort-frontend.vercel.app/';

export async function generateReceiptPDF(booking, shouldPrint = false) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const goldColor = [197, 160, 89]; // #C5A059
  const darkColor = [26, 32, 44];   // #1A202C
  const grayColor = [113, 128, 150]; // #718096

  // 1. Header Banner & Branding
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFillColor(...goldColor);
  doc.rect(0, 38, 210, 3, 'F');

  // Resort Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SHRI SADGURU RESORT', 105, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(218, 165, 32);
  doc.text('LUXURY LIVING & SERENE TRANQUILLITY • SHEGAON, MAHARASHTRA', 105, 25, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  doc.text(`Contact: ${OWNER_NAME} - ${OWNER_PHONE} • Web: ${RESORT_WEBSITE_URL}`, 105, 30, { align: 'center' });
  doc.setFontSize(7);
  doc.text(RESORT_OFFICIAL_ADDRESS, 105, 34, { align: 'center' });

  // 2. Receipt Badge
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('GUEST REGISTRATION & OFFICIAL RECEIPT', 105, 52, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Booking Reference: ${booking.id || 'N/A'}  |  Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 105, 58, { align: 'center' });

  // 3. Guest & Room Details Table
  autoTable(doc, {
    startY: 64,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4, textColor: [33, 37, 41] },
    headStyles: { fillColor: [...darkColor], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['GUEST IDENTIFICATION', 'ROOM & ALLOTMENT DETAILS']],
    body: [
      [
        `Stay Category: ${booking.stayType || 'Standard/Family'}\n` +
        `Primary Guest: ${booking.customerName || 'N/A'}\n` +
        `Mobile Contact: ${booking.phone || 'N/A'}\n` +
        `ID Verification: ${booking.aadhaarNumber ? `Aadhaar (${booking.aadhaarNumber})` : (booking.idProofType || 'Alternative ID / Manual')}\n` +
        (booking.secondGuestName ? `Second Guest / Partner: ${booking.secondGuestName} (${booking.secondGuestAge ? `${booking.secondGuestAge} Yrs` : ''})\nPartner Aadhaar: ${booking.secondGuestAadhaar || 'N/A'}\n` : '') +
        `Age / DOB: ${booking.age ? `${booking.age} Yrs` : 'N/A'}${booking.dob ? ` (${booking.dob})` : ''}\n` +
        `Occupants: ${booking.adults || booking.guests || 2} Adults${booking.children ? `, ${booking.children} Children` : ''}`,

        `Room Number: ${booking.roomNumber || 'Assigned on Arrival'}\n` +
        `Category: ${booking.category || 'Deluxe AC'}\n` +
        `Check-In: ${booking.checkIn || 'N/A'} (${booking.checkInTime || '12:00 PM'})\n` +
        `Check-Out: ${booking.checkOut || 'N/A'} (${booking.checkOutTime || '11:00 AM'})\n` +
        `Duration: ${booking.durationHours ? `${booking.durationHours} Hours` : `${booking.nights || 1} Night(s)`}`
      ]
    ]
  });

  // 4. Financial & Payment Summary Table
  const lastY = doc.lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: lastY,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [74, 85, 104], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['DESCRIPTION', 'RATE / NIGHT', 'DURATION', 'SUBTOTAL (INR)']],
    body: [
      [
        `Room Allotment (${booking.category || 'Deluxe Room'} - Room ${booking.roomNumber || ''})`,
        `INR ${(Number(booking.nightlyRate) || Number(booking.totalAmount)).toLocaleString('en-IN')}`,
        `${booking.nights || 1} Night(s)`,
        `INR ${(Number(booking.subtotal) || Number(booking.totalAmount)).toLocaleString('en-IN')}`
      ],
      [
        'Taxes & Hospitality Surcharge',
        '-',
        '-',
        `INR ${(Number(booking.taxAmount) || 0).toLocaleString('en-IN')}`
      ],
      [
        { content: 'TOTAL PAYABLE AMOUNT:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `INR ${(Number(booking.totalAmount) || 0).toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } }
      ],
      [
        { content: `AMOUNT RECEIVED / ADVANCE (${booking.paymentMethod || 'Cash'}):`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', textColor: [16, 149, 193] } },
        { content: `INR ${(Number(booking.advancePaid) || 0).toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: [16, 149, 193] } }
      ],
      [
        { content: 'REMAINING BALANCE DUE AT RECEPTION:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', textColor: Number(booking.remainingBalance) > 0 ? [220, 38, 38] : [22, 163, 74] } },
        { content: `INR ${(Number(booking.remainingBalance) || 0).toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', textColor: Number(booking.remainingBalance) > 0 ? [220, 38, 38] : [22, 163, 74] } }
      ]
    ]
  });

  // 5. House Rules & Policy Note
  const rulesY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('RESORT POLICIES & TERMS:', 14, rulesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  const rules = [
    '1. Standard check-in is 12:00 PM and check-out is 11:00 AM. Early check-out can be processed upon request.',
    '2. Government identity card verification is mandatory for all adult guests per local law.',
    '3. Swimming pool access timings: 06:00 AM - 09:00 PM with proper nylon swimwear mandatory.',
    '4. Full remaining balance must be cleared at reception prior to or upon departure.'
  ];
  let curY = rulesY + 5;
  rules.forEach(rule => {
    doc.text(rule, 14, curY);
    curY += 4.5;
  });

  // 6. Signatures
  const sigY = curY + 12;
  doc.setDrawColor(180, 180, 180);
  doc.line(20, sigY, 75, sigY);
  doc.line(135, sigY, 190, sigY);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('Guest Signature', 47.5, sigY + 5, { align: 'center' });
  doc.text('Authorized Resort Front Desk', 162.5, sigY + 5, { align: 'center' });

  // Output Handling (Native Android & Web Browser)
  const fileName = `Sadguru_Resort_Receipt_${booking.id || 'Booking'}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
      // Extract Base64 string from jsPDF
      const dataUri = doc.output('datauristring');
      const base64Data = dataUri.split(',')[1];

      // Save directly to device Cache directory (no special permissions required)
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // Launch native Android chooser for viewing, printing, saving to Downloads, or sharing
      await Share.share({
        title: shouldPrint ? 'Print Sadguru Resort Receipt' : 'Save Sadguru Resort Receipt',
        text: `Official Booking Receipt - Room ${booking.roomNumber || ''} (${booking.customerName || ''})`,
        url: savedFile.uri,
        dialogTitle: shouldPrint ? 'Print / Save Receipt' : 'Download / Save PDF Receipt'
      });

      return { success: true, uri: savedFile.uri };
    } catch (nativeErr) {
      console.warn('Native Capacitor PDF handling warning:', nativeErr);
      doc.save(fileName);
      return { success: true };
    }
  } else {
    // Standard Desktop / Web Browser
    if (shouldPrint) {
      doc.autoPrint();
      const blob = doc.output('bloburl');
      window.open(blob, '_blank');
    } else {
      doc.save(fileName);
    }
    return { success: true };
  }
}

export function formatReceiptWhatsAppMessage(booking) {
  const isCouple = booking.stayType === 'Couple' || Boolean(booking.secondGuestName);
  
  const lines = [
    '🏨 *Shri Sadguru resort booking - booking confirmation*',
    '━━━━━━━━━━━━━━━━━━━━━',
    `*Booking ID:* ${booking.id || 'N/A'}`,
    `*Guest Name:* ${booking.customerName || 'N/A'}`,
    booking.secondGuestName ? `*Partner Name:* ${booking.secondGuestName}${booking.secondGuestAge ? ` (${booking.secondGuestAge} Yrs)` : ''}` : null,
    `*Guest Check-in Time:* ${booking.checkIn || 'Today'} (${booking.checkInTime || '12:00 PM'})`,
    `*Guest Check-out Time:* ${booking.checkOut || 'Tomorrow'} (${booking.checkOutTime || '11:00 AM'})`,
    `*Stay Type:* ${booking.stayType || (isCouple ? 'Couple' : 'Family')}`,
    `*Room Number:* Room ${booking.roomNumber || 'Assigned'} (${booking.category || 'Deluxe AC'})`,
    `*Total Amount:* ₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`,
    '━━━━━━━━━━━━━━━━━━━━━',
    `📍 *Address:* ${RESORT_OFFICIAL_ADDRESS}`,
    `📞 *Contact:* ${OWNER_NAME} - ${OWNER_PHONE}`,
    `🌐 ${RESORT_WEBSITE_URL}`
  ].filter(Boolean);

  return lines.join('\n');
}

export function shareReceiptWhatsApp(booking, targetPhone = null) {
  const rawPhone = targetPhone || booking.phone || '';
  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
  
  if (!cleanPhone) {
    alert('Please enter a valid phone number to share WhatsApp receipt.');
    return;
  }
  
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const text = formatReceiptWhatsAppMessage(booking);
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function shareReceiptToOwner(booking) {
  shareReceiptWhatsApp(booking, OWNER_PHONE);
}
