import { redirect, type Handle } from '@sveltejs/kit';
import { adminCookieName, verifyAdminCookie } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const env = event.platform?.env;
	event.locals.db = env?.DB;
	event.locals.adminPassword = env?.ADMIN_PASSWORD ?? '';
	event.locals.turnstileSiteKey = env?.TURNSTILE_SITE_KEY ?? '';
	event.locals.turnstileSecretKey = env?.TURNSTILE_SECRET_KEY ?? '';

	const path = event.url.pathname;
	const isAdmin = path.startsWith('/admin');
	const isLogin = path === '/admin/login';

	if (isAdmin && !isLogin) {
		const ok = await verifyAdminCookie(
			event.cookies.get(adminCookieName()),
			event.locals.adminPassword
		);
		if (!ok) {
			throw redirect(303, '/admin/login');
		}
	}

	return resolve(event);
};
