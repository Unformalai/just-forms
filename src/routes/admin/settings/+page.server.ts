import { error, fail } from '@sveltejs/kit';
import { getSetting, setSetting } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.db) throw error(503, 'Database is not bound.');
	return { webhookUrl: await getSetting(locals.db, 'webhook_url') };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.db) return fail(503, { message: 'Database is not bound.' });
		const webhookUrl = String((await request.formData()).get('webhook_url') ?? '').trim();
		if (webhookUrl) {
			try {
				const parsed = new URL(webhookUrl);
				if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
					return fail(400, { message: 'Webhook URL must be http or https.', webhookUrl });
				}
			} catch {
				return fail(400, { message: 'Webhook URL is not valid.', webhookUrl });
			}
		}
		await setSetting(locals.db, 'webhook_url', webhookUrl);
		return { saved: true, webhookUrl };
	}
};
