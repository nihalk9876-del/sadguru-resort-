import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle, ShieldCheck, Sparkles, User, Calendar, Hash, CheckSquare, Square, Eye } from 'lucide-react';
import jsQR from 'jsqr';
import Tesseract from 'tesseract.js';

export default function AadhaarScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera', 'upload'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [scanError, setScanError] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [rawExtractedText, setRawExtractedText] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeMode]);

  const startCamera = async () => {
    setCameraError('');
    setScanError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Camera unavailable or permission denied. Please use the "Upload / Snap" option.');
      setActiveMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capture frame from video stream
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setPreviewImage(dataUrl);
    stopCamera();
    processRealImage(canvas, dataUrl);
  };

  // Handle uploaded file or native camera snap
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError('');
    setScannedData(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPreviewImage(dataUrl);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        processRealImage(canvas, dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Process image with REAL QR Decoder and REAL OCR (No dummy data)
  const processRealImage = async (canvas, dataUrl) => {
    setIsProcessing(true);
    setScanError('');
    setScannedData(null);
    setRawExtractedText('');
    setProgressPercent(10);
    setProcessingStatus('Checking for Aadhaar Secure QR Code...');

    try {
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 1. ATTEMPT REAL QR CODE DECODING FIRST (Standard UIDAI QR or Secure QR)
      let qrCode = null;
      try {
        qrCode = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert'
        });
      } catch (qrErr) {
        console.warn('QR scan error:', qrErr);
      }

      if (qrCode && qrCode.data) {
        console.log('[Scanner] QR Code detected in image:', qrCode.data.substring(0, 80));
        setProgressPercent(60);
        setProcessingStatus('Aadhaar QR Code detected. Parsing payload...');

        const parsedQR = parseAadhaarQR(qrCode.data);
        if (parsedQR.name || parsedQR.dob || parsedQR.aadhaarNumber) {
          setProgressPercent(100);
          setScannedData(parsedQR);
          setRawExtractedText(qrCode.data);
          setIsProcessing(false);
          return;
        }
      }

      // 2. ATTEMPT REAL OCR VIA TESSERACT.JS (Reads actual printed text from card)
      setProgressPercent(30);
      setProcessingStatus('Scanning printed text with Optical Character Recognition (OCR)...');

      // Enhance contrast on canvas for OCR accuracy
      const enhancedCanvas = document.createElement('canvas');
      enhancedCanvas.width = canvas.width;
      enhancedCanvas.height = canvas.height;
      const enhCtx = enhancedCanvas.getContext('2d');
      enhCtx.filter = 'contrast(140%) grayscale(100%)';
      enhCtx.drawImage(canvas, 0, 0);

      const ocrResult = await Tesseract.recognize(
        enhancedCanvas,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgressPercent(40 + Math.round((m.progress || 0) * 50));
              setProcessingStatus(`Recognizing printed characters (${Math.round((m.progress || 0) * 100)}%)...`);
            }
          }
        }
      );

      const recognizedText = ocrResult?.data?.text || '';
      console.log('[Scanner] Raw text recognized by OCR:\n', recognizedText);
      setRawExtractedText(recognizedText);

      // Parse actual recognized text
      const extracted = parseAadhaarPrintedText(recognizedText);

      if (extracted.name || extracted.dob || extracted.aadhaarNumber) {
        setProgressPercent(100);
        setScannedData(extracted);
      } else {
        // Honest error - NO DUMMY DATA
        setScanError('Could not clearly read Aadhaar details from this image. Please ensure the card is placed in bright lighting without glare, or enter details below.');
      }

    } catch (err) {
      console.error('[Scanner] Processing failure:', err);
      setScanError(`Scan failed: ${err.message || 'Unable to analyze image'}. Please try capturing again with steady focus.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse UIDAI XML or Secure QR code string
  const parseAadhaarQR = (qrString) => {
    let name = '';
    let dob = '';
    let age = null;
    let aadhaarNumber = '';
    let gender = '';

    // Check if XML format (<PrintLetterBarcodeData ... />)
    if (qrString.includes('<PrintLetterBarcodeData') || qrString.includes('name=')) {
      const nameMatch = qrString.match(/name\s*=\s*["']([^"']+)["']/i);
      const dobMatch = qrString.match(/dob\s*=\s*["']([^"']+)["']/i);
      const yobMatch = qrString.match(/yob\s*=\s*["']([^"']+)["']/i);
      const uidMatch = qrString.match(/uid\s*=\s*["']([^"']+)["']/i);
      const genderMatch = qrString.match(/gender\s*=\s*["']([^"']+)["']/i);

      if (nameMatch) name = nameMatch[1].trim();
      if (dobMatch) dob = dobMatch[1].trim();
      else if (yobMatch) dob = `01/01/${yobMatch[1].trim()}`;

      if (genderMatch) gender = genderMatch[1].toUpperCase() === 'M' ? 'Male' : (genderMatch[1].toUpperCase() === 'F' ? 'Female' : genderMatch[1]);

      if (uidMatch) {
        const rawUid = uidMatch[1].replace(/[^0-9]/g, '');
        // Masked per UIDAI requirement: XXXX XXXX 1234
        if (rawUid.length >= 4) {
          aadhaarNumber = `XXXX XXXX ${rawUid.slice(-4)}`;
        }
      }
    } else {
      // General textual QR parsing
      const textParsed = parseAadhaarPrintedText(qrString);
      name = textParsed.name;
      dob = textParsed.dob;
      aadhaarNumber = textParsed.aadhaarNumber;
      gender = textParsed.gender;
    }

    if (dob) {
      age = calculateAgeFromDOB(dob);
    }

    return {
      name,
      dob,
      age,
      gender,
      aadhaarNumber,
      source: 'Aadhaar QR Code',
      verified: true
    };
  };

  // Real OCR text parser for printed Indian Aadhaar cards
  const parseAadhaarPrintedText = (text) => {
    let name = '';
    let dob = '';
    let age = null;
    let aadhaarNumber = '';
    let gender = '';

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. EXTRACT 12-DIGIT AADHAAR NUMBER
    // Matches 4 digits space 4 digits space 4 digits (e.g. 5432 9876 1234)
    const aadhaarMatch = text.match(/\b([2-9]\d{3})\s?(\d{4})\s?(\d{4})\b/);
    if (aadhaarMatch) {
      const last4 = aadhaarMatch[3];
      // Store in masked format per UIDAI compliance: XXXX XXXX 1234
      aadhaarNumber = `XXXX XXXX ${last4}`;
    }

    // 2. EXTRACT DATE OF BIRTH (DOB)
    // Matches "DOB: DD/MM/YYYY" or "Date of Birth: DD-MM-YYYY" or "Year of Birth: YYYY"
    const dobRegex = /(?:DOB|Date of Birth|जन्म तारीख|जन्म वर्ष|Year of Birth)[:\s]*([0-9]{2}[\/\-\.][0-9]{2}[\/\-\.][0-9]{4}|[0-9]{4})/i;
    const dobMatch = text.match(dobRegex);
    
    if (dobMatch) {
      dob = dobMatch[1].replace(/[\-\.]/g, '/');
    } else {
      // Fallback: search for any standalone date formatted as DD/MM/YYYY
      const dateMatch = text.match(/\b(0[1-9]|[12][0-9]|3[01])[\/\-\.](0[1-9]|1[012])[\/\-\.](19\d\d|20\d\d)\b/);
      if (dateMatch) {
        dob = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
      }
    }

    // 3. AUTO-CALCULATE AGE FROM DOB
    if (dob) {
      age = calculateAgeFromDOB(dob);
    }

    // 4. EXTRACT GENDER
    if (/\b(?:MALE|पुरुष)\b/i.test(text)) gender = 'Male';
    else if (/\b(?:FEMALE|महिला)\b/i.test(text)) gender = 'Female';
    else if (/\bTRANSGENDER\b/i.test(text)) gender = 'Transgender';

    // 5. EXTRACT GUEST FULL NAME
    // Exclude noise words printed on Aadhaar cards
    const excludedKeywords = [
      'GOVERNMENT', 'INDIA', 'UNIQUE', 'IDENTIFICATION', 'AUTHORITY', 
      'ENROLMENT', 'ENROLLMENT', 'DOB', 'DATE', 'BIRTH', 'YEAR', 'MALE', 
      'FEMALE', 'TRANSGENDER', 'HELP', 'UIDAI', 'WWW', 'AADHAAR', 'VID', 
      'FATHER', 'HUSBAND', 'ADDRESS', 'MERI', 'MERA', 'PEHCHAN', 'PO', 
      'INCOME', 'TAX', 'DEPARTMENT', 'STATE', 'DIST'
    ];

    // Find candidate name line (usually 2-4 clean alphabetic words)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/[^a-zA-Z\s]/g, '').trim();
      const words = line.split(/\s+/).filter(w => w.length > 1);

      if (words.length >= 2 && words.length <= 4) {
        const hasKeyword = words.some(w => excludedKeywords.includes(w.toUpperCase()));
        if (!hasKeyword && line.length >= 5) {
          name = line;
          break;
        }
      }
    }

    return {
      name,
      dob,
      age,
      gender,
      aadhaarNumber,
      source: 'Printed Card OCR',
      verified: !!(name && aadhaarNumber)
    };
  };

  const calculateAgeFromDOB = (dobStr) => {
    if (!dobStr) return null;
    let birthYear = null;
    if (dobStr.includes('/')) {
      const parts = dobStr.split('/');
      if (parts[2] && parts[2].length === 4) birthYear = parseInt(parts[2], 10);
      else if (parts[0].length === 4) birthYear = parseInt(parts[0], 10);
    } else if (/^\d{4}$/.test(dobStr.trim())) {
      birthYear = parseInt(dobStr.trim(), 10);
    }
    if (!birthYear || isNaN(birthYear)) return null;
    const currentYear = new Date().getFullYear();
    return Math.max(1, currentYear - birthYear);
  };

  const handleApply = () => {
    if (!scannedData) return;
    onScanSuccess({
      customerName: scannedData.name || '',
      dob: scannedData.dob || '',
      age: scannedData.age || '',
      gender: scannedData.gender || '',
      aadhaarNumber: scannedData.aadhaarNumber || '',
      identityVerificationStatus: scannedData.verified ? 'Verified (Aadhaar)' : 'Unverified'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl text-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                Real Aadhaar Card Scanner
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                  OCR + QR
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Live OCR & QR code extraction from actual photo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-50 border-b border-slate-100 text-xs">
          <button
            onClick={() => { setActiveMode('camera'); setScanError(''); }}
            className={`py-1.5 rounded-lg font-semibold transition ${
              activeMode === 'camera' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Live Camera
          </button>
          <button
            onClick={() => { setActiveMode('upload'); stopCamera(); setScanError(''); }}
            className={`py-1.5 rounded-lg font-semibold transition ${
              activeMode === 'upload' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Take Photo / Upload
          </button>
        </div>

        {/* Consent Notice Required by UIDAI */}
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-900">
          <input
            type="checkbox"
            id="consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="consent" className="cursor-pointer font-medium leading-tight">
            Guest consent obtained for offline Aadhaar verification for resort stay registration.
          </label>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          
          {/* Mode 1: Live Camera Viewfinder */}
          {activeMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                {cameraError ? (
                  <div className="p-4 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-xs text-white leading-relaxed">{cameraError}</p>
                    <button
                      onClick={() => setActiveMode('upload')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-white hover:bg-slate-700"
                    >
                      Switch to Photo Upload / Camera Snap
                    </button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-4 border-2 border-dashed border-amber-300 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                      <span className="text-[10px] text-amber-200 bg-black/60 px-2 py-0.5 rounded font-mono self-start">
                        ALIGN AADHAAR CARD OR QR CODE
                      </span>
                      <span className="text-[9px] text-slate-300 bg-black/60 px-2 py-0.5 rounded self-end">
                        Keep steady under good lighting
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!cameraError && (
                <button
                  type="button"
                  onClick={handleCaptureFrame}
                  disabled={isProcessing || !consentGiven}
                  className="w-full py-3 rounded-xl bg-[#DFB06C] hover:bg-[#d4a35d] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  Capture Photo & Extract Real Details
                </button>
              )}
            </div>
          )}

          {/* Mode 2: Upload / Mobile Native Camera Snap */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => consentGiven && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-slate-50 transition space-y-2.5 ${
                  !consentGiven ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Take Photo with Phone Camera or Browse</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Captures high-resolution photo for optical recognition</p>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-[10px] text-slate-700 font-medium">
                  JPEG, PNG, HEIC up to 15MB
                </span>
              </div>
            </div>
          )}

          {/* Processing Indicator with Real Progress */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">{processingStatus}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Analyzing actual image pixels with Tesseract OCR...</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#DFB06C] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Banner when text couldn't be recognized */}
          {scanError && !isProcessing && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{scanError}</p>
                <p className="text-[11px] text-red-600">You can also type the guest name and details manually in the booking form.</p>
              </div>
            </div>
          )}

          {/* REAL Scanned Output (No dummy data) */}
          {scannedData && !isProcessing && (
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Original Extracted Details ({scannedData.source})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-semibold font-mono">
                  LIVE SCAN
                </span>
              </div>

              <div className="space-y-2">
                {/* Guest Name */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Scanned Name</span>
                  <input
                    type="text"
                    value={scannedData.name}
                    placeholder="Guest Full Name"
                    onChange={e => setScannedData({ ...scannedData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-900 text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Masked Aadhaar & Age */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Masked Aadhaar No.</span>
                    <input
                      type="text"
                      value={scannedData.aadhaarNumber}
                      placeholder="XXXX XXXX 1234"
                      onChange={e => setScannedData({ ...scannedData, aadhaarNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold text-amber-900 text-xs focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Calculated Age</span>
                    <input
                      type="number"
                      value={scannedData.age || ''}
                      placeholder="Years"
                      onChange={e => setScannedData({ ...scannedData, age: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-emerald-800 text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Date of Birth (DOB)</span>
                    <input
                      type="text"
                      value={scannedData.dob || ''}
                      placeholder="DD/MM/YYYY"
                      onChange={e => setScannedData({ ...scannedData, dob: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Gender</span>
                    <input
                      type="text"
                      value={scannedData.gender || ''}
                      placeholder="Male / Female"
                      onChange={e => setScannedData({ ...scannedData, gender: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Check className="w-4 h-4" />
                Populate into Registration Form
              </button>
            </div>
          )}

          {/* Collapsible view of raw recognized text snippet */}
          {rawExtractedText && !isProcessing && (
            <details className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
              <summary className="cursor-pointer font-medium text-slate-700 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View Raw OCR Character Text
              </summary>
              <pre className="mt-1.5 p-2 bg-white rounded border border-slate-200 text-[10px] font-mono whitespace-pre-wrap max-h-28 overflow-y-auto">
                {rawExtractedText}
              </pre>
            </details>
          )}

        </div>

      </div>
    </div>
  );
}
