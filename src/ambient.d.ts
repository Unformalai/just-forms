interface D1Result<T = unknown> {
	results: T[];
	success: boolean;
	meta?: Record<string, unknown>;
}

interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = unknown>(): Promise<T | null>;
	all<T = unknown>(): Promise<D1Result<T>>;
	run<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
	prepare(query: string): D1PreparedStatement;
	exec(query: string): Promise<unknown>;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface ExecutionContext {
	waitUntil(promise: Promise<unknown>): void;
	passThroughOnException(): void;
}

interface CacheStorage {
	default: unknown;
	open(name: string): Promise<unknown>;
}
