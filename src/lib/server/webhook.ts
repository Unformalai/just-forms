export async function notifyWebhook(url: string, payload: unknown) {
	if (!url) return;
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;
		await fetch(parsed.toString(), {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
	} catch {
		// Submission already saved. Webhook is best-effort.
	}
}
