-- Just Forms D1 schema + seed
-- Apply with: npx wrangler d1 execute just-forms --file=schema.sql

CREATE TABLE IF NOT EXISTS forms (
	id TEXT PRIMARY KEY,
	slug TEXT UNIQUE NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fields (
	id TEXT PRIMARY KEY,
	form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	label TEXT NOT NULL,
	type TEXT NOT NULL,
	required INTEGER NOT NULL DEFAULT 0,
	options TEXT,
	position INTEGER NOT NULL DEFAULT 0,
	show_if TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
	id TEXT PRIMARY KEY,
	form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
	name TEXT,
	email TEXT,
	started_at TEXT NOT NULL DEFAULT (datetime('now')),
	submitted_at TEXT,
	status TEXT NOT NULL DEFAULT 'started',
	utm_source TEXT
);

CREATE TABLE IF NOT EXISTS answers (
	id TEXT PRIMARY KEY,
	submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
	field_id TEXT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
	value TEXT
);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT
);

INSERT OR IGNORE INTO forms (id, slug, title, description) VALUES (
	'form_intake',
	'intake',
	'Intake',
	'A short form for people who found you. Change it, or add another row in forms and fields.'
);

INSERT OR IGNORE INTO fields (id, form_id, name, label, type, required, options, position, show_if) VALUES
	('fld_name', 'form_intake', 'name', 'Name', 'text', 1, NULL, 1, NULL),
	('fld_email', 'form_intake', 'email', 'Email', 'email', 1, NULL, 2, NULL),
	('fld_trying', 'form_intake', 'trying_to_do', 'What were you trying to do?', 'textarea', 1, NULL, 3, NULL),
	('fld_found', 'form_intake', 'found_us', 'How did you find us?', 'choice', 1, '["search","friend","other"]', 4, NULL),
	('fld_found_other', 'form_intake', 'found_us_other', 'Tell us a bit more', 'text', 0, NULL, 5, '{"field":"found_us","equals":"other"}'),
	('fld_utm', 'form_intake', 'utm_source', 'utm_source', 'hidden', 0, NULL, 6, NULL);

INSERT OR IGNORE INTO settings (key, value) VALUES ('webhook_url', '');
