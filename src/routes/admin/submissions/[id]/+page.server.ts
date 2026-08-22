import { error } from '@sveltejs/kit';
import { getSubmission } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.db) throw error(503, 'Database is not bound.');
	const data = await getSubmission(locals.db, params.id);
	if (!data) throw error(404, 'Submission not found.');
	return data;
};
