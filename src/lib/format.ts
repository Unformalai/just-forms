export function csvEscape(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replaceAll('"', '""')}"`;
	}
	return value;
}

export function answersAsText(
	answers: { label?: string; name?: string; value: string | null }[]
): string {
	return answers
		.map((a) => `${a.label || a.name || 'Field'}: ${a.value ?? ''}`)
		.join('\n');
}

export function formatWhen(iso: string | null | undefined): string {
	if (!iso) return '';
	const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString('en-GB', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}
