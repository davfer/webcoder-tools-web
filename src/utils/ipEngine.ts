export interface IpAnalysis {
  isIp: boolean;
  version: 4 | 6 | null;
  isCidr: boolean;
  ip: string;
  cidrPrefix?: number;
  netmask?: string;
  wildcard?: string;
  networkAddress?: string;
  broadcastAddress?: string;
  firstUsableIp?: string;
  lastUsableIp?: string;
  totalHosts?: number;
  usableHosts?: number;
  ipType: 'Private (RFC 1918)' | 'Public' | 'Loopback' | 'Link-Local' | 'Multicast' | 'IPv6';
  integerValue?: number;
  binaryRepresentation?: string;
}

export function analyzeIp(input: string): IpAnalysis {
  const trimmed = input.trim();
  if (!trimmed) return emptyIp();

  // Check IPv4 with optional CIDR
  const ipv4Regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\/(\d{1,2}))?$/;
  const matchV4 = trimmed.match(ipv4Regex);

  if (matchV4) {
    const rawIp = matchV4[1];
    const prefixStr = matchV4[2];
    const octets = rawIp.split('.').map(Number);

    if (octets.some((o) => o < 0 || o > 255)) {
      return emptyIp();
    }

    const prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : 32;
    if (prefix < 0 || prefix > 32) return emptyIp();

    const isCidr = prefixStr !== undefined;

    // Convert to 32-bit uint
    const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const bcastInt = (netInt | ~maskInt) >>> 0;

    const intToIp = (val: number) => [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255,
    ].join('.');

    const netmask = intToIp(maskInt);
    const wildcard = intToIp(~maskInt >>> 0);
    const networkAddress = intToIp(netInt);
    const broadcastAddress = intToIp(bcastInt);

    const totalHosts = prefix === 32 ? 1 : Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

    const firstUsableIp = prefix >= 31 ? networkAddress : intToIp(netInt + 1);
    const lastUsableIp = prefix >= 31 ? broadcastAddress : intToIp(bcastInt - 1);

    // Classification
    let ipType: IpAnalysis['ipType'] = 'Public';
    if (octets[0] === 10) ipType = 'Private (RFC 1918)';
    else if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ipType = 'Private (RFC 1918)';
    else if (octets[0] === 192 && octets[1] === 168) ipType = 'Private (RFC 1918)';
    else if (octets[0] === 127) ipType = 'Loopback';
    else if (octets[0] === 169 && octets[1] === 254) ipType = 'Link-Local';
    else if (octets[0] >= 224 && octets[0] <= 239) ipType = 'Multicast';

    const binaryRepresentation = octets
      .map((o) => o.toString(2).padStart(8, '0'))
      .join('.');

    return {
      isIp: true,
      version: 4,
      isCidr,
      ip: rawIp,
      cidrPrefix: prefix,
      netmask,
      wildcard,
      networkAddress,
      broadcastAddress,
      firstUsableIp,
      lastUsableIp,
      totalHosts,
      usableHosts,
      ipType,
      integerValue: ipInt,
      binaryRepresentation,
    };
  }

  // Check IPv6
  const isV6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(\/\d{1,3})?$/.test(
    trimmed
  );

  if (isV6) {
    return {
      isIp: true,
      version: 6,
      isCidr: trimmed.includes('/'),
      ip: trimmed,
      ipType: 'IPv6',
    };
  }

  return emptyIp();
}

function emptyIp(): IpAnalysis {
  return {
    isIp: false,
    version: null,
    isCidr: false,
    ip: '',
    ipType: 'Public',
  };
}
