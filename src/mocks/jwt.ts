/**
 * Fake JWT utilities for the mock BFF layer.
 *
 * Deterministic, Web Crypto-free base64url encoding so it works in the
 * browser AND in node/jsdom (MSW interceptors run in both). The "signature"
 * is a simple string hash — this is a mock, NOT real cryptography.
 */

export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const JWT_SECRET = 'nova-wallet-mock-secret';

export interface AccessTokenClaims {
  sub: string;
  name: string;
  email: string;
}

export interface JwtPayload extends AccessTokenClaims {
  iat: number;
  exp: number;
  typ: 'access' | 'refresh';
}

export interface VerifyResult {
  valid: boolean;
  expired: boolean;
  payload?: JwtPayload;
}

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function utf8ToBytes(input: string): number[] {
  return Array.from(new TextEncoder().encode(input));
}

function bytesToUtf8(bytes: number[]): string {
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

/** Pure-JS base64 encode (no Buffer / btoa dependency). */
function base64Encode(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64_CHARS[b0 >> 2];
    out += B64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? B64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? B64_CHARS[b2 & 0x3f] : '=';
  }
  return out;
}

/** Pure-JS base64 decode. */
function base64Decode(input: string): number[] {
  const clean = input.replace(/=+$/, '');
  const bytes: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const ch of clean) {
    const val = B64_CHARS.indexOf(ch);
    if (val === -1) throw new Error('Invalid base64 input');
    acc = (acc << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
    }
  }
  return bytes;
}

/** UTF-8 safe base64url encode (browser + node). */
export function base64UrlEncode(input: string): string {
  return base64Encode(utf8ToBytes(input)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** UTF-8 safe base64url decode (browser + node). */
export function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  return bytesToUtf8(base64Decode(base64));
}

/**
 * Simple deterministic string hash (FNV-1a style, hex output).
 * Stands in for HMAC — fine for a mock, never use in production.
 */
function mockHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ ch, 0x85ebca6b);
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h1) + toHex(h2);
}

function sign(data: string): string {
  return base64UrlEncode(mockHash(`${data}.${JWT_SECRET}`));
}

function createToken(claims: AccessTokenClaims, ttlMs: number, typ: 'access' | 'refresh'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const payload: JwtPayload = {
    ...claims,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ttlMs) / 1000),
    typ,
  };
  const data = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  return `${data}.${sign(data)}`;
}

export function signAccessToken(payload: AccessTokenClaims): string {
  return createToken(payload, ACCESS_TOKEN_TTL_MS, 'access');
}

export function signRefreshToken(sub: string): string {
  return createToken({ sub, name: '', email: '' }, REFRESH_TOKEN_TTL_MS, 'refresh');
}

export function verifyToken(token: string): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, expired: false };
  const [headerB64, payloadB64, signature] = parts;
  const data = `${headerB64}.${payloadB64}`;

  if (sign(data) !== signature) return { valid: false, expired: false };

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;
  } catch {
    return { valid: false, expired: false };
  }

  if (typeof payload.exp !== 'number') return { valid: false, expired: false };
  const expired = payload.exp * 1000 <= Date.now();
  return { valid: !expired, expired, payload };
}
