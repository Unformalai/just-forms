export async function verifyTurnstile(
	secret: string | undefined,
	token: FormDataEntryValue | null,
	ip: string | null
): Promise<{ ok: boolean; skipped: boolean }> {
	if (!secret) return { ok: true, skipped: true };
	if (!token || typeof token !== 'string') return { ok: false, skipped: false };

	const body = new URLSearchParams();
	body.set('secret', secret);
	body.set('response', token);
	if (ip) body.set('remoteip', ip);

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body
	});
	if (!res.ok) return { ok: false, skipped: false };
	const data = (await res.json()) as { success?: boolean };
	return { ok: Boolean(data.success), skipped: false };
}
