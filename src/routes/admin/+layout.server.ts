import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	return {
		path: url.pathname,
		usingDefaultPassword: locals.adminPassword === 'change-me' || !locals.adminPassword
	};
};
