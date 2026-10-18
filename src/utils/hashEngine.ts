// CRC32 calculation table
const makeCRCTable = () => {
  let c: number;
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
};

const crcTable = makeCRCTable();

export function calculateCRC32(str: string): string {
  let crc = 0 ^ -1;
  const bytes = new TextEncoder().encode(str);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
}

// Pure JS MD5 implementation for instant browser checksums
export function calculateMD5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  const bytes = new TextEncoder().encode(string);
  const n = bytes.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (i = 64; i <= n; i += 64) {
    const chunk: number[] = [];
    for (let j = 0; j < 16; j++) {
      const idx = i - 64 + j * 4;
      chunk[j] = bytes[idx] | (bytes[idx + 1] << 8) | (bytes[idx + 2] << 16) | (bytes[idx + 3] << 24);
    }
    md5cycle(state, chunk);
  }

  const rem = n % 64;
  for (i = 0; i < rem; i++) {
    tail[i >> 2] |= bytes[n - rem + i] << ((i % 4) << 3);
  }
  tail[rem >> 2] |= 0x80 << ((rem % 4) << 3);

  if (rem > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);

  function rhex(n: number) {
    let s = '', j = 0;
    for (; j < 4; j++) {
      s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
    }
    return s;
  }

  return (rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3])).toLowerCase();
}

export async function calculateWebCryptoHash(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface HashDetection {
  isLikelyHash: boolean;
  algorithm: string;
  bitLength: number;
  description: string;
}

export function detectHashType(input: string): HashDetection {
  const trimmed = input.trim();

  if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(trimmed)) {
    return { isLikelyHash: true, algorithm: 'bcrypt', bitLength: 184, description: 'Bcrypt password hash' };
  }
  if (/^\$argon2(id|i|d)\$v=\d+\$m=\d+,t=\d+,p=\d+\$[./A-Za-z0-9]+\$[./A-Za-z0-9]+$/.test(trimmed)) {
    return { isLikelyHash: true, algorithm: 'Argon2', bitLength: 256, description: 'Argon2 memory-hard key derivation hash' };
  }
  if (/^\$6\$[./A-Za-z0-9]{1,16}\$[./A-Za-z0-9]{86}$/.test(trimmed)) {
    return { isLikelyHash: true, algorithm: 'SHA-512 Crypt', bitLength: 512, description: 'Linux/Unix shadow SHA-512 password hash' };
  }

  // Hex hashes
  if (/^[a-fA-F0-9]+$/.test(trimmed)) {
    const len = trimmed.length;
    switch (len) {
      case 8:
        return { isLikelyHash: true, algorithm: 'CRC32 / Adler32', bitLength: 32, description: '32-bit checksum' };
      case 32:
        return { isLikelyHash: true, algorithm: 'MD5 / NTLM', bitLength: 128, description: '128-bit MD5 or NTLM digest' };
      case 40:
        return { isLikelyHash: true, algorithm: 'SHA-1 / Git Object ID', bitLength: 160, description: '160-bit SHA-1 or Git commit hash' };
      case 64:
        return { isLikelyHash: true, algorithm: 'SHA-256', bitLength: 256, description: '256-bit Secure Hash Algorithm' };
      case 96:
        return { isLikelyHash: true, algorithm: 'SHA-384', bitLength: 384, description: '384-bit Secure Hash Algorithm' };
      case 128:
        return { isLikelyHash: true, algorithm: 'SHA-512', bitLength: 512, description: '512-bit Secure Hash Algorithm' };
    }
  }

  return { isLikelyHash: false, algorithm: 'Unknown', bitLength: 0, description: '' };
}

export interface PasswordScore {
  entropyBits: number;
  score: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Military-grade';
  crackTimeEstimate: string;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function evaluatePassword(password: string): PasswordScore {
  if (!password) {
    return {
      entropyBits: 0,
      score: 'Very Weak',
      crackTimeEstimate: 'Instant',
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSymbol: false,
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;
  if (poolSize === 0) poolSize = 1;

  const entropyBits = Math.round(password.length * Math.log2(poolSize));

  let score: PasswordScore['score'] = 'Very Weak';
  let crackTime = 'Instant';

  if (entropyBits < 28) {
    score = 'Very Weak';
    crackTime = '< 1 millisecond';
  } else if (entropyBits < 40) {
    score = 'Weak';
    crackTime = 'Several seconds';
  } else if (entropyBits < 60) {
    score = 'Fair';
    crackTime = 'A few hours to months';
  } else if (entropyBits < 80) {
    score = 'Strong';
    crackTime = 'Decades to centuries';
  } else {
    score = 'Military-grade';
    crackTime = 'Billions of years';
  }

  return {
    entropyBits,
    score,
    crackTimeEstimate: crackTime,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
  };
}
