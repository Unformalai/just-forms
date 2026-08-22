import { error, redirect } from '@sveltejs/kit';
import { getFormBySlug, getSetting, parseShowIf, requireDb } from '$lib/server/db';
import { verifyTurnstile } from '$lib/server/turnstile';
import { notifyWebhook } from '$lib/server/webhook';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	const db = requireDb(locals.db);
	const formData = await request.formData();
	const slug = String(formData.get('form_slug') ?? '');
	if (!slug) throw error(400, 'Missing form.');

	const loaded = await getFormBySlug(db, slug);
	if (!loaded) throw error(404, 'Form not found.');

	const turnstile = await verifyTurnstile(
		locals.turnstileSecretKey,
		formData.get('cf-turnstile-response'),
		getClientAddress()
	);
	if (!turnstile.ok) throw error(400, 'Turnstile check failed.');

	const answers: { field: (typeof loaded.fields)[number]; value: string }[] = [];
	for (const field of loaded.fields) {
		const showIf = parseShowIf(field.show_if);
		if (showIf && String(formData.get(showIf.field) ?? '') !== showIf.equals) {
			continue;
		}
		const value = String(formData.get(field.name) ?? '').trim();
		if (field.required && !value) {
			throw error(400, `${field.label} is required.`);
		}
		if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			throw error(400, 'Email looks off.');
		}
		answers.push({ field, value });
	}

	const name = answers.find((a) => a.field.name === 'name')?.value ?? '';
	const email = answers.find((a) => a.field.name === 'email')?.value ?? '';
	const utm = answers.find((a) => a.field.name === 'utm_source')?.value ?? '';
	const startedAt = String(formData.get('started_at') ?? '') || new Date().toISOString();
	const submittedAt = new Date().toISOString();
	const submissionId = crypto.randomUUID();

	await db
		.prepare(
			`INSERT INTO submissions (id, form_id, name, email, started_at, submitted_at, status, utm_source)
			 VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?)`
		)
		.bind(submissionId, loaded.form.id, name, email, startedAt, submittedAt, utm)
		.run();

	for (const answer of answers) {
		await db
			.prepare('INSERT INTO answers (id, submission_id, field_id, value) VALUES (?, ?, ?, ?)')
			.bind(crypto.randomUUID(), submissionId, answer.field.id, answer.value)
			.run();
	}

	const webhookUrl = await getSetting(db, 'webhook_url');
	if (webhookUrl) {
		await notifyWebhook(webhookUrl, {
			form: { id: loaded.form.id, slug: loaded.form.slug, title: loaded.form.title },
			submission: {
				id: submissionId,
				name,
				email,
				started_at: startedAt,
				submitted_at: submittedAt,
				status: 'submitted',
				utm_source: utm
			},
			answers: answers.map((a) => ({
				name: a.field.name,
				label: a.field.label,
				value: a.value
			}))
		});
	}

	throw redirect(303, `/thanks?form=${encodeURIComponent(loaded.form.slug)}`);
};
