import { fail, redirect } from '@sveltejs/kit';
import { adminCookieName, signAdminCookie, timingSafeEqual, verifyAdminCookie } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const ok = await verifyAdminCookie(cookies.get(adminCookieName()), locals.adminPassword);
	if (ok) throw redirect(303, '/admin/submissions');
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies, locals, url }) => {
		const password = String((await request.formData()).get('password') ?? '');
		const expected = locals.adminPassword;
		if (!expected) {
			return fail(400, { message: 'Set ADMIN_PASSWORD in .dev.vars or as a wrangler secret.' });
		}
		if (!timingSafeEqual(password, expected)) {
			return fail(401, { message: 'Wrong password.' });
		}
		cookies.set(adminCookieName(), await signAdminCookie(expected), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:',
			maxAge: 60 * 60 * 24 * 14
		});
		throw redirect(303, '/admin/submissions');
	},
	logout: async ({ cookies }) => {
		cookies.delete(adminCookieName(), { path: '/' });
		throw redirect(303, '/admin/login');
	}
};
