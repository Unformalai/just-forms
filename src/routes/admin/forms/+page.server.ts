import { error } from '@sveltejs/kit';
import { listForms } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.db) throw error(503, 'Database is not bound.');
	const forms = await listForms(locals.db);
	const counts = await locals.db
		.prepare('SELECT form_id, count(*) as n FROM submissions GROUP BY form_id')
		.all<{ form_id: string; n: number }>();
	const byForm = Object.fromEntries(counts.results.map((row) => [row.form_id, row.n]));
	return {
		forms: forms.map((form) => ({
			...form,
			submissions: byForm[form.id] ?? 0
		}))
	};
};
