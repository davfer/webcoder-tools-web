export interface Base64Analysis {
  isBase64: boolean;
  type: 'standard' | 'url-safe' | 'base32' | 'none';
  decodedText: string;
  isPrintable: boolean;
  hexDump: string;
  encodedSize: number;
  decodedSize: number;
}

export function analyzeBase64(input: string): Base64Analysis {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 4) {
    return {
      isBase64: false,
      type: 'none',
      decodedText: '',
      isPrintable: false,
      hexDump: '',
      encodedSize: 0,
      decodedSize: 0,
    };
  }

  // Check URL-safe Base64
  const isUrlSafe = /^[A-Za-z0-9_-]+=*$/.test(trimmed) && (trimmed.includes('-') || trimmed.includes('_'));
  // Check Standard Base64
  const isStdBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0;
  // Check Base32
  const isBase32 = /^[A-Z2-7]+=*$/.test(trimmed) && trimmed.length % 8 === 0 && !isStdBase64;

  if (!isUrlSafe && !isStdBase64 && !isBase32) {
    // Might be unpadded base64
    const isLoose = /^[A-Za-z0-9+/]{4,}$/.test(trimmed);
    if (!isLoose) {
      return {
        isBase64: false,
        type: 'none',
        decodedText: '',
        isPrintable: false,
        hexDump: '',
        encodedSize: trimmed.length,
        decodedSize: 0,
      };
    }
  }

  try {
    let normalized = trimmed;
    if (isUrlSafe) {
      normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');
      while (normalized.length % 4 !== 0) {
        normalized += '=';
      }
    }

    const binaryString = atob(normalized);
    const bytes = new Uint8Array(binaryString.length);
    let printableCount = 0;

    for (let i = 0; i < binaryString.length; i++) {
      const code = binaryString.charCodeAt(i);
      bytes[i] = code;
      if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
        printableCount++;
      }
    }

    const isPrintable = binaryString.length > 0 && printableCount / binaryString.length > 0.85;

    // Hex dump snippet
    const hexParts: string[] = [];
    const maxBytes = Math.min(bytes.length, 64);
    for (let i = 0; i < maxBytes; i++) {
      hexParts.push(bytes[i].toString(16).padStart(2, '0'));
    }
    const hexDump = hexParts.join(' ') + (bytes.length > 64 ? '...' : '');

    let decodedText = '';
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      decodedText = decoder.decode(bytes);
    } catch {
      decodedText = binaryString;
    }

    return {
      isBase64: true,
      type: isUrlSafe ? 'url-safe' : isBase32 ? 'base32' : 'standard',
      decodedText,
      isPrintable,
      hexDump,
      encodedSize: trimmed.length,
      decodedSize: bytes.length,
    };
  } catch {
    return {
      isBase64: false,
      type: 'none',
      decodedText: '',
      isPrintable: false,
      hexDump: '',
      encodedSize: trimmed.length,
      decodedSize: 0,
    };
  }
}

export function encodeBase64(text: string, urlSafe = false): string {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    if (urlSafe) {
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return b64;
  } catch {
    return '';
  }
}
