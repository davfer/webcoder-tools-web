export interface JsonAnalysis {
  isValidJson: boolean;
  parsed: any;
  formatted: string;
  minified: string;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  stats: {
    type: 'object' | 'array' | 'primitive';
    keysCount: number;
    depth: number;
    sizeBytes: number;
  };
}

export function analyzeJson(input: string): JsonAnalysis {
  const trimmed = input.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return {
      isValidJson: false,
      parsed: null,
      formatted: '',
      minified: '',
      stats: { type: 'primitive', keysCount: 0, depth: 0, sizeBytes: 0 },
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const formatted = JSON.stringify(parsed, null, 2);
    const minified = JSON.stringify(parsed);

    const isArray = Array.isArray(parsed);
    const isObject = parsed !== null && typeof parsed === 'object' && !isArray;

    let keysCount = 0;
    if (isObject) {
      keysCount = Object.keys(parsed).length;
    } else if (isArray) {
      keysCount = parsed.length;
    }

    const calcDepth = (obj: any, current = 1): number => {
      if (obj === null || typeof obj !== 'object') return current;
      const values = Object.values(obj);
      if (values.length === 0) return current;
      return Math.max(...values.map((v) => calcDepth(v, current + 1)));
    };

    return {
      isValidJson: true,
      parsed,
      formatted,
      minified,
      stats: {
        type: isArray ? 'array' : isObject ? 'object' : 'primitive',
        keysCount,
        depth: calcDepth(parsed),
        sizeBytes: new TextEncoder().encode(trimmed).length,
      },
    };
  } catch (err: any) {
    const msg = err?.message || 'Invalid JSON';
    let line: number | undefined;
    let column: number | undefined;
    const match = msg.match(/at position (\d+)/i) || msg.match(/line (\d+) column (\d+)/i);

    if (match) {
      if (match.length === 3) {
        line = parseInt(match[1], 10);
        column = parseInt(match[2], 10);
      } else if (match.length === 2) {
        const pos = parseInt(match[1], 10);
        const upToPos = trimmed.slice(0, pos);
        const lines = upToPos.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    return {
      isValidJson: false,
      parsed: null,
      formatted: '',
      minified: '',
      error: {
        message: msg,
        line,
        column,
      },
      stats: {
        type: 'primitive',
        keysCount: 0,
        depth: 0,
        sizeBytes: new TextEncoder().encode(trimmed).length,
      },
    };
  }
}

export function queryJsonPath(data: any, path: string): { result: any; error?: string } {
  if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '.') {
    return { result: data };
  }

  const cleanPath = path.startsWith('$.') ? path.slice(2) : path.startsWith('.') ? path.slice(1) : path;
  const segments = cleanPath.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);

  let current = data;
  for (const seg of segments) {
    if (current === null || current === undefined) {
      return { result: undefined, error: `Cannot read property '${seg}' of null or undefined` };
    }
    current = current[seg];
  }

  return { result: current };
}
