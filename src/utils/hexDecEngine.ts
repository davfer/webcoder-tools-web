export interface HexDecAnalysis {
  isConvertible: boolean;
  detectedType: 'hex' | 'decimal' | 'binary' | 'ascii' | 'none';
  hex: string;
  decimal: string;
  binary: string;
  octal: string;
  ascii: string;
  byteCount: number;
  bigIntValue?: string;
}

export function analyzeHexDec(input: string): HexDecAnalysis {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isConvertible: false,
      detectedType: 'none',
      hex: '',
      decimal: '',
      binary: '',
      octal: '',
      ascii: '',
      byteCount: 0,
    };
  }

  // Check if pure hex (with optional 0x)
  const isHexOnly = /^(0x)?[0-9a-fA-F]+$/.test(trimmed);
  // Check if pure decimal number
  const isDecOnly = /^\d+$/.test(trimmed);
  // Check if pure binary string
  const isBinOnly = /^(0b)?[01]+$/.test(trimmed) && trimmed.length >= 4;

  try {
    if (isBinOnly) {
      const cleanBin = trimmed.replace(/^0b/, '');
      const big = BigInt('0b' + cleanBin);
      return {
        isConvertible: true,
        detectedType: 'binary',
        binary: cleanBin,
        decimal: big.toString(10),
        hex: big.toString(16).toUpperCase(),
        octal: big.toString(8),
        ascii: binaryToAscii(cleanBin),
        byteCount: Math.ceil(cleanBin.length / 8),
        bigIntValue: big.toString(10),
      };
    }

    if (isHexOnly && (trimmed.startsWith('0x') || trimmed.length % 2 === 0 || /^[a-fA-F]/.test(trimmed))) {
      const cleanHex = trimmed.replace(/^0x/, '');
      const big = BigInt('0x' + cleanHex);
      let ascii = '';
      try {
        const matches = cleanHex.match(/.{1,2}/g) || [];
        ascii = matches.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('');
      } catch {}

      return {
        isConvertible: true,
        detectedType: 'hex',
        hex: cleanHex.toUpperCase(),
        decimal: big.toString(10),
        binary: big.toString(2),
        octal: big.toString(8),
        ascii,
        byteCount: Math.ceil(cleanHex.length / 2),
        bigIntValue: big.toString(10),
      };
    }

    if (isDecOnly) {
      const big = BigInt(trimmed);
      return {
        isConvertible: true,
        detectedType: 'decimal',
        decimal: trimmed,
        hex: big.toString(16).toUpperCase(),
        binary: big.toString(2),
        octal: big.toString(8),
        ascii: '',
        byteCount: Math.ceil(big.toString(2).length / 8),
        bigIntValue: big.toString(10),
      };
    }

    // Treat as ASCII string
    const bytes = new TextEncoder().encode(trimmed);
    const hexParts: string[] = [];
    const binParts: string[] = [];

    bytes.forEach((b) => {
      hexParts.push(b.toString(16).padStart(2, '0'));
      binParts.push(b.toString(2).padStart(8, '0'));
    });

    const fullHex = hexParts.join('');
    const big = fullHex ? BigInt('0x' + fullHex) : BigInt(0);

    return {
      isConvertible: true,
      detectedType: 'ascii',
      hex: fullHex.toUpperCase(),
      decimal: big.toString(10),
      binary: binParts.join(' '),
      octal: big.toString(8),
      ascii: trimmed,
      byteCount: bytes.length,
      bigIntValue: big.toString(10),
    };
  } catch {
    return {
      isConvertible: false,
      detectedType: 'none',
      hex: '',
      decimal: '',
      binary: '',
      octal: '',
      ascii: '',
      byteCount: 0,
    };
  }
}

function binaryToAscii(bin: string): string {
  const padded = bin.padStart(Math.ceil(bin.length / 8) * 8, '0');
  const bytes = padded.match(/.{8}/g) || [];
  return bytes.map((b) => String.fromCharCode(parseInt(b, 2))).join('');
}
