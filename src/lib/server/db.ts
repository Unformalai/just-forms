export type FormRow = {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	created_at: string;
};

export type FieldRow = {
	id: string;
	form_id: string;
	name: string;
	label: string;
	type: string;
	required: number;
	options: string | null;
	position: number;
	show_if: string | null;
};

export type ShowIf = { field: string; equals: string };

export type SubmissionRow = {
	id: string;
	form_id: string;
	name: string | null;
	email: string | null;
	started_at: string;
	submitted_at: string | null;
	status: string;
	utm_source: string | null;
};

export type AnswerRow = {
	id: string;
	submission_id: string;
	field_id: string;
	value: string | null;
	label?: string;
	name?: string;
};

export function requireDb(db: D1Database | undefined): D1Database {
	if (!db) {
		throw new Error('D1 is not bound. Create the database and paste database_id into wrangler.jsonc.');
	}
	return db;
}

export function parseOptions(raw: string | null): string[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
}

export function parseShowIf(raw: string | null): ShowIf | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as ShowIf;
		if (parsed && typeof parsed.field === 'string' && typeof parsed.equals === 'string') {
			return parsed;
		}
		return null;
	} catch {
		return null;
	}
}

export async function getFormBySlug(db: D1Database, slug: string) {
	const form = await db
		.prepare('SELECT * FROM forms WHERE slug = ?')
		.bind(slug)
		.first<FormRow>();
	if (!form) return null;
	const fields = (
		await db
			.prepare('SELECT * FROM fields WHERE form_id = ? ORDER BY position ASC')
			.bind(form.id)
			.all<FieldRow>()
	).results;
	return { form, fields };
}

export async function listForms(db: D1Database) {
	return (await db.prepare('SELECT * FROM forms ORDER BY created_at DESC').all<FormRow>()).results;
}

export async function listSubmissions(db: D1Database) {
	return (
		await db
			.prepare(
				`SELECT s.*, f.slug as form_slug, f.title as form_title
				 FROM submissions s
				 JOIN forms f ON f.id = s.form_id
				 ORDER BY coalesce(s.submitted_at, s.started_at) DESC`
			)
			.all<SubmissionRow & { form_slug: string; form_title: string }>()
	).results;
}

export async function getSubmission(db: D1Database, id: string) {
	const submission = await db
		.prepare(
			`SELECT s.*, f.slug as form_slug, f.title as form_title
			 FROM submissions s
			 JOIN forms f ON f.id = s.form_id
			 WHERE s.id = ?`
		)
		.bind(id)
		.first<SubmissionRow & { form_slug: string; form_title: string }>();
	if (!submission) return null;
	const answers = (
		await db
			.prepare(
				`SELECT a.*, fld.label, fld.name, fld.position
				 FROM answers a
				 JOIN fields fld ON fld.id = a.field_id
				 WHERE a.submission_id = ?
				 ORDER BY fld.position ASC`
			)
			.bind(id)
			.all<AnswerRow & { position: number }>()
	).results;
	return { submission, answers };
}

export async function getSetting(db: D1Database, key: string) {
	const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
	return row?.value ?? '';
}

export async function setSetting(db: D1Database, key: string, value: string) {
	await db
		.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
		.bind(key, value)
		.run();
}
