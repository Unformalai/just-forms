import { error } from '@sveltejs/kit';
import { listSubmissions } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.db) throw error(503, 'Database is not bound.');
	return { submissions: await listSubmissions(locals.db) };
};
