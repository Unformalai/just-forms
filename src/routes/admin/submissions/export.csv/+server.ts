import { error } from '@sveltejs/kit';
import { csvEscape } from '$lib/format';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.db) throw error(503, 'Database is not bound.');

	const fields = (
		await locals.db
			.prepare('SELECT id, name, label, position FROM fields ORDER BY position ASC')
			.all<{ id: string; name: string; label: string; position: number }>()
	).results;

	const submissions = (
		await locals.db
			.prepare(
				`SELECT s.*, f.slug as form_slug
				 FROM submissions s
				 JOIN forms f ON f.id = s.form_id
				 ORDER BY coalesce(s.submitted_at, s.started_at) DESC`
			)
			.all<{
				id: string;
				form_slug: string;
				name: string | null;
				email: string | null;
				started_at: string;
				submitted_at: string | null;
				status: string;
				utm_source: string | null;
			}>()
	).results;

	const answers = (
		await locals.db
			.prepare('SELECT submission_id, field_id, value FROM answers')
			.all<{ submission_id: string; field_id: string; value: string | null }>()
	).results;

	const bySubmission = new Map<string, Map<string, string>>();
	for (const answer of answers) {
		if (!bySubmission.has(answer.submission_id)) bySubmission.set(answer.submission_id, new Map());
		bySubmission.get(answer.submission_id)!.set(answer.field_id, answer.value ?? '');
	}

	const header = [
		'id',
		'form',
		'name',
		'email',
		'started_at',
		'submitted_at',
		'status',
		...fields.map((field) => field.name)
	];

	const lines = [header.map(csvEscape).join(',')];
	for (const row of submissions) {
		const map = bySubmission.get(row.id) ?? new Map();
		lines.push(
			[
				row.id,
				row.form_slug,
				row.name ?? '',
				row.email ?? '',
				row.started_at,
				row.submitted_at ?? '',
				row.status,
				...fields.map((field) => map.get(field.id) ?? '')
			]
				.map(csvEscape)
				.join(',')
		);
	}

	return new Response(lines.join('\n') + '\n', {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="submissions.csv"'
		}
	});
};
