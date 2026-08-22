import { error } from '@sveltejs/kit';
import { getFormBySlug, parseOptions, parseShowIf } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	if (!locals.db) {
		throw error(503, 'Database is not bound. Follow the README to create D1 and apply schema.sql.');
	}
	const data = await getFormBySlug(locals.db, params.slug);
	if (!data) throw error(404, 'Form not found.');

	return {
		form: data.form,
		fields: data.fields.map((field) => ({
			...field,
			options: parseOptions(field.options),
			showIf: parseShowIf(field.show_if)
		})),
		utmSource: url.searchParams.get('utm_source') ?? '',
		turnstileSiteKey: locals.turnstileSiteKey
	};
};
