declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				ADMIN_PASSWORD?: string;
				TURNSTILE_SITE_KEY?: string;
				TURNSTILE_SECRET_KEY?: string;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
		}
		interface Locals {
			db?: D1Database;
			adminPassword: string;
			turnstileSiteKey: string;
			turnstileSecretKey: string;
		}
	}
}

export {};
