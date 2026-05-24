const FALLBACK_ENCODING = "utf-8";
const GBK_ENCODINGS = ["gb18030", "gbk"];

export function decodeReportFile(input) {
  const bytes = toBytes(input);
  if (!bytes.length) {
    return { text: "", encoding: FALLBACK_ENCODING, confidence: "empty" };
  }

  const bomEncoding = detectBom(bytes);
  if (bomEncoding) {
    return {
      text: cleanDecodedText(decodeWithEncoding(bytes, bomEncoding)),
      encoding: bomEncoding,
      confidence: "bom"
    };
  }

  const likelyUtf16 = detectUtf16ByNullPattern(bytes);
  const candidates = unique([
    likelyUtf16,
    FALLBACK_ENCODING,
    ...GBK_ENCODINGS,
    "utf-16le",
    "utf-16be"
  ].filter(Boolean));

  const decodedCandidates = candidates
    .map((encoding) => tryDecode(bytes, encoding, likelyUtf16))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (decodedCandidates.length) {
    const best = decodedCandidates[0];
    return {
      text: best.text,
      encoding: best.encoding,
      confidence: best.confidence
    };
  }

  return {
    text: cleanDecodedText(new TextDecoder(FALLBACK_ENCODING).decode(bytes)),
    encoding: FALLBACK_ENCODING,
    confidence: "fallback"
  };
}

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  return new Uint8Array();
}

function detectBom(bytes) {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
  return "";
}

function detectUtf16ByNullPattern(bytes) {
  const sampleLength = Math.min(bytes.length, 4096);
  let evenNulls = 0;
  let oddNulls = 0;
  let pairs = 0;

  for (let index = 0; index + 1 < sampleLength; index += 2) {
    if (bytes[index] === 0) evenNulls += 1;
    if (bytes[index + 1] === 0) oddNulls += 1;
    pairs += 1;
  }

  if (pairs < 8) return "";

  const evenRatio = evenNulls / pairs;
  const oddRatio = oddNulls / pairs;

  if (oddRatio > 0.35 && evenRatio < 0.05) return "utf-16le";
  if (evenRatio > 0.35 && oddRatio < 0.05) return "utf-16be";
  return "";
}

function tryDecode(bytes, encoding, likelyUtf16) {
  try {
    const text = cleanDecodedText(decodeWithEncoding(bytes, encoding));
    return {
      text,
      encoding,
      confidence: encoding === likelyUtf16 ? "pattern" : "heuristic",
      score: scoreDecodedText(text, encoding, likelyUtf16)
    };
  } catch {
    return null;
  }
}

function decodeWithEncoding(bytes, encoding) {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch (error) {
    if (encoding === "utf-16be") return decodeUtf16Be(bytes);
    throw error;
  }
}

function decodeUtf16Be(bytes) {
  const start = bytes[0] === 0xfe && bytes[1] === 0xff ? 2 : 0;
  const chunks = [];
  const chunkSize = 8192;

  for (let offset = start; offset + 1 < bytes.length; offset += chunkSize * 2) {
    const codes = [];
    const end = Math.min(bytes.length, offset + chunkSize * 2);
    for (let index = offset; index + 1 < end; index += 2) {
      codes.push((bytes[index] << 8) | bytes[index + 1]);
    }
    chunks.push(String.fromCharCode(...codes));
  }

  return chunks.join("");
}

function scoreDecodedText(text, encoding, likelyUtf16) {
  const sample = text.slice(0, 50000);
  let score = 0;

  if (encoding === likelyUtf16) score += 120;
  if (encoding === FALLBACK_ENCODING) score += 10;

  const strongMarkers = [
    "Statement,Header",
    "Account Information,Header",
    "Net Asset Value,Header",
    "Open Positions,Header",
    "Trades,Header",
    "Realized & Unrealized Performance Summary,Header"
  ];

  for (const marker of strongMarkers) {
    if (sample.includes(marker)) score += 80;
  }

  score += Math.min(countMatches(sample, /(?:^|\r?\n)[^,\r\n]+,Header,/g), 20) * 12;
  score += Math.min(countMatches(sample, /(?:^|\r?\n)[^,\r\n]+,Data,/g), 80) * 2;
  score += Math.min(countMatches(sample, /Interactive Brokers/g), 5) * 20;

  score -= countMatches(sample, /\uFFFD/g) * 50;
  score -= countMatches(sample, /\u0000/g) * 30;
  score -= countMatches(sample, /[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g) * 10;

  if (!sample.trim()) score -= 500;
  return score;
}

function cleanDecodedText(text) {
  return text.replace(/^\uFEFF/, "");
}

function countMatches(text, pattern) {
  return text.match(pattern)?.length || 0;
}

function unique(values) {
  return Array.from(new Set(values));
}
