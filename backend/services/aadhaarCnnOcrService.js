const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

let ort = null;
try {
  ort = require('onnxruntime-node');
} catch (e) {
  console.warn('[CNN OCR] onnxruntime-node not loaded:', e.message);
}

const MODEL_PATH = path.join(__dirname, '..', 'ml', 'aadhaar_cnn.onnx');
const LABELS_PATH = path.join(__dirname, '..', 'ml', 'labels.json');

// Default Roboflow AADHAAR-CARD-DETAILS class mapping (overridden if labels.json exists)
const DEFAULT_LABELS = ['aadhaar_number', 'dob', 'gender', 'name'];

let sessionPromise = null;
let ocrWorkerPromise = null;

function getLabels() {
  try {
    if (fs.existsSync(LABELS_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(LABELS_PATH, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_LABELS;
}

async function getCnnSession() {
  if (!ort || !fs.existsSync(MODEL_PATH)) return null;
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['cpu']
    }).catch((err) => {
      console.warn('[CNN OCR] Failed to load ONNX model:', err.message);
      sessionPromise = null;
      return null;
    });
  }
  return sessionPromise;
}

async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker('eng').catch((err) => {
      ocrWorkerPromise = null;
      throw err;
    });
  }
  return ocrWorkerPromise;
}

// Verhoeff Checksum Table for 12-digit Indian Aadhaar validation
const VERHOEFF_D = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]
];
const VERHOEFF_P = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
];

function isValidAadhaarVerhoeff(num12) {
  if (!/^\d{12}$/.test(num12)) return false;
  let c = 0;
  const digits = num12.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }
  return c === 0;
}

function calculateAgeFromDOB(dobStr) {
  if (!dobStr) return null;
  const clean = dobStr.replace(/[\-\.]/g, '/').trim();
  const match = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const dob = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 0 && age <= 120 ? age : null;
  }
  if (/^\d{4}$/.test(clean)) {
    const year = parseInt(clean, 10);
    const age = new Date().getFullYear() - year;
    return age >= 0 && age <= 120 ? age : null;
  }
  return null;
}

/**
 * Compute Intersection over Union (IoU) for Non-Maximum Suppression
 */
function computeIoU(a, b) {
  const x1 = Math.max(a.x1, b.x1);
  const y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2);
  const y2 = Math.min(a.y2, b.y2);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);
  return inter / (areaA + areaB - inter + 1e-6);
}

/**
 * Run YOLOv8 ONNX CNN inference to detect Aadhaar field bounding boxes
 */
async function detectFieldsWithCNN(imageBuffer) {
  const session = await getCnnSession();
  if (!session) return null;

  const meta = await sharp(imageBuffer).metadata();
  const origW = meta.width || 640;
  const origH = meta.height || 640;
  const inputSize = 640;

  // Letterbox resize to 640x640 RGB
  const scale = Math.min(inputSize / origW, inputSize / origH);
  const newW = Math.round(origW * scale);
  const newH = Math.round(origH * scale);
  const padX = Math.floor((inputSize - newW) / 2);
  const padY = Math.floor((inputSize - newH) / 2);

  const { data } = await sharp(imageBuffer)
    .resize(newW, newH)
    .extend({
      top: padY,
      bottom: inputSize - newH - padY,
      left: padX,
      right: inputSize - newW - padX,
      background: { r: 114, g: 114, b: 114 }
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert HWC uint8 [0..255] -> NCHW float32 [0..1]
  const floatData = new Float32Array(3 * inputSize * inputSize);
  const area = inputSize * inputSize;
  for (let i = 0; i < area; i++) {
    floatData[i] = data[i * 3] / 255.0;
    floatData[area + i] = data[i * 3 + 1] / 255.0;
    floatData[2 * area + i] = data[i * 3 + 2] / 255.0;
  }

  const tensor = new ort.Tensor('float32', floatData, [1, 3, inputSize, inputSize]);
  const feeds = { [session.inputNames[0]]: tensor };
  const outputMap = await session.run(feeds);
  const output = outputMap[session.outputNames[0]];

  // YOLOv8 output shape: [1, 4 + numClasses, 8400]
  const [, channels, numBoxes] = output.dims;
  const numClasses = channels - 4;
  const labels = getLabels();
  const raw = output.data;

  const candidates = [];
  for (let i = 0; i < numBoxes; i++) {
    let bestClass = -1;
    let bestScore = 0.25; // confidence threshold
    for (let c = 0; c < numClasses; c++) {
      const score = raw[(4 + c) * numBoxes + i];
      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    }
    if (bestClass === -1) continue;

    const cx = raw[0 * numBoxes + i];
    const cy = raw[1 * numBoxes + i];
    const w = raw[2 * numBoxes + i];
    const h = raw[3 * numBoxes + i];

    // Convert back to original image coordinates with slight margin padding
    const x1 = Math.max(0, Math.round(((cx - w / 2) - padX) / scale) - 6);
    const y1 = Math.max(0, Math.round(((cy - h / 2) - padY) / scale) - 6);
    const x2 = Math.min(origW, Math.round(((cx + w / 2) - padX) / scale) + 6);
    const y2 = Math.min(origH, Math.round(((cy + h / 2) - padY) / scale) + 6);

    if (x2 > x1 + 5 && y2 > y1 + 5) {
      candidates.push({
        label: (labels[bestClass] || `class_${bestClass}`).toLowerCase(),
        score: bestScore,
        x1, y1, x2, y2
      });
    }
  }

  // NMS per class: keep highest confidence box for each field
  candidates.sort((a, b) => b.score - a.score);
  const selected = [];
  for (const cand of candidates) {
    const overlaps = selected.some(
      (s) => s.label === cand.label && computeIoU(s, cand) > 0.45
    );
    if (!overlaps) selected.push(cand);
  }

  return selected;
}

/**
 * Parse raw Aadhaar OCR text cleanly (used for full-card fallback or refinement)
 */
function parseAadhaarText(rawText) {
  const cleanText = String(rawText || '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 1);

  let aadhaarNumber = '';
  let dob = '';
  let gender = '';
  let name = '';

  // 1. Aadhaar 12-digit number (prefer Verhoeff-valid match)
  const all12Matches = [...cleanText.matchAll(/\b(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{4})\b/g)];
  for (const m of all12Matches) {
    const digits = `${m[1]}${m[2]}${m[3]}`;
    if (isValidAadhaarVerhoeff(digits)) {
      aadhaarNumber = `${m[1]} ${m[2]} ${m[3]}`;
      break;
    }
  }
  if (!aadhaarNumber && all12Matches.length > 0) {
    const m = all12Matches[0];
    aadhaarNumber = `${m[1]} ${m[2]} ${m[3]}`;
  }

  // 2. DOB / Year of Birth
  const dobRegex = /(?:DOB|D\.O\.B|Birth|Year of Birth|YOB)?\s*[:\.\-]?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i;
  const dobMatch = cleanText.match(dobRegex);
  if (dobMatch) {
    dob = dobMatch[1].replace(/[\-\.]/g, '/');
  } else {
    const yobMatch = cleanText.match(/(?:Year of Birth|YOB|Birth)\s*[:\.\-]?\s*(\d{4})/i);
    if (yobMatch) dob = yobMatch[1];
  }

  // 3. Gender
  if (/\bFEMALE\b/i.test(cleanText)) gender = 'Female';
  else if (/\bMALE\b/i.test(cleanText)) gender = 'Male';
  else if (/\bTRANSGENDER\b/i.test(cleanText)) gender = 'Transgender';

  // 4. Name (line right above DOB, skipping government boilerplate)
  const skipRegex = /government|india|uidai|unique|identification|authority|aadhaar|dob|birth|male|female|year|address|enrollment|help@|www\./i;
  if (dob) {
    const dobLineIdx = lines.findIndex(l => l.includes(dob) || l.includes(dob.replace(/\//g, '-')) || /DOB|Birth/i.test(l));
    for (let i = dobLineIdx - 1; i >= 0; i--) {
      const candidate = lines[i].replace(/[^a-zA-Z\s\.]/g, '').trim();
      if (candidate.length >= 3 && candidate.length <= 45 && !skipRegex.test(candidate)) {
        name = candidate;
        break;
      }
    }
  }
  if (!name) {
    for (const line of lines) {
      const candidate = line.replace(/[^a-zA-Z\s\.]/g, '').trim();
      if (candidate.length >= 4 && candidate.length <= 40 && /^[A-Za-z\s\.]+$/.test(candidate) && !skipRegex.test(candidate)) {
        name = candidate;
        break;
      }
    }
  }

  return {
    name,
    dob,
    age: calculateAgeFromDOB(dob),
    gender,
    aadhaarNumber,
    rawText: cleanText
  };
}

/**
 * Main Advanced CNN + OCR Pipeline
 */
async function analyzeAadhaarImage(imageBase64) {
  const base64Clean = String(imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Clean, 'base64');

  const worker = await getOcrWorker();
  const cnnBoxes = await detectFieldsWithCNN(imageBuffer);

  let result = {
    name: '',
    dob: '',
    age: null,
    gender: '',
    aadhaarNumber: '',
    rawText: '',
    confidence: 0,
    engine: cnnBoxes && cnnBoxes.length > 0 ? 'CNN (YOLOv8 ONNX) + OCR' : 'Server Enhanced Multi-Pass OCR',
    cnnActive: Boolean(cnnBoxes && cnnBoxes.length > 0)
  };

  // Path 1: CNN Detected Field Crops -> High-Precision Per-Box OCR
  if (cnnBoxes && cnnBoxes.length > 0) {
    const textSnippets = [];
    for (const box of cnnBoxes) {
      try {
        const cropBuffer = await sharp(imageBuffer)
          .extract({
            left: box.x1,
            top: box.y1,
            width: box.x2 - box.x1,
            height: box.y2 - box.y1
          })
          .resize({ width: Math.max(300, (box.x2 - box.x1) * 2) })
          .grayscale()
          .normalize()
          .sharpen()
          .png()
          .toBuffer();

        const ocrRes = await worker.recognize(cropBuffer);
        const text = (ocrRes?.data?.text || '').trim();
        textSnippets.push(`[${box.label}]: ${text}`);

        if (box.label.includes('name') && !result.name) {
          result.name = text.replace(/[^a-zA-Z\s\.]/g, ' ').replace(/\s+/g, ' ').trim();
        } else if (box.label.includes('dob') && !result.dob) {
          const m = text.match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/) || text.match(/(\d{4})/);
          if (m) result.dob = m[1].replace(/[\-\.]/g, '/');
        } else if (box.label.includes('gender') && !result.gender) {
          if (/female/i.test(text)) result.gender = 'Female';
          else if (/male/i.test(text)) result.gender = 'Male';
        } else if ((box.label.includes('aadhaar') || box.label.includes('uid') || box.label.includes('number')) && !result.aadhaarNumber) {
          const m = text.match(/(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{4})/);
          if (m) result.aadhaarNumber = `${m[1]} ${m[2]} ${m[3]}`;
        }
      } catch (boxErr) {
        console.warn(`[CNN OCR] Crop OCR warning (${box.label}):`, boxErr.message);
      }
    }
    result.rawText = textSnippets.join('\n');
    result.age = calculateAgeFromDOB(result.dob);
    result.confidence = 96;
  }

  // Path 2: Full-card Server Enhanced Preprocessing + OCR (fallback or fill missing fields)
  if (!result.name || !result.dob || !result.aadhaarNumber) {
    const meta = await sharp(imageBuffer).metadata();
    const targetW = Math.min(2000, Math.max(1200, (meta.width || 800) * 2));

    const enhancedBuffer = await sharp(imageBuffer)
      .resize({ width: targetW })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.4 })
      .png()
      .toBuffer();

    const fullOcr = await worker.recognize(enhancedBuffer);
    const parsed = parseAadhaarText(fullOcr?.data?.text || '');

    result.name = result.name || parsed.name;
    result.dob = result.dob || parsed.dob;
    result.age = result.age || parsed.age;
    result.gender = result.gender || parsed.gender;
    result.aadhaarNumber = result.aadhaarNumber || parsed.aadhaarNumber;
    result.rawText = result.rawText
      ? `${result.rawText}\n--- Full Card ---\n${parsed.rawText}`
      : parsed.rawText;
    if (!result.confidence) {
      result.confidence = Math.round(fullOcr?.data?.confidence || 82);
    }
  }

  return result;
}

function getModelStatus() {
  return {
    cnnModelPresent: fs.existsSync(MODEL_PATH),
    onnxRuntimeLoaded: Boolean(ort),
    modelPath: MODEL_PATH
  };
}

module.exports = {
  analyzeAadhaarImage,
  getModelStatus
};
