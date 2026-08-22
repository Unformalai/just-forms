const COOKIE = 'jf_admin';

function bytesToHex(buf: ArrayBuffer): string {
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function digest(secret: string, value: string): Promise<string> {
	const data = new TextEncoder().encode(`${secret}:${value}`);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return bytesToHex(hash);
}

export async function signAdminCookie(secret: string): Promise<string> {
	const payload = 'ok';
	return `${payload}.${await digest(secret, payload)}`;
}

export async function verifyAdminCookie(token: string | undefined, secret: string): Promise<boolean> {
	if (!token || !secret) return false;
	const dot = token.indexOf('.');
	if (dot < 0) return false;
	const payload = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	if (payload !== 'ok' || !sig) return false;
	const expected = await digest(secret, payload);
	return timingSafeEqual(expected, sig);
}

export function adminCookieName() {
	return COOKIE;
}

export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}
