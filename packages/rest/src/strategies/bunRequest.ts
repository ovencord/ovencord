import type { ResponseLike } from '../shared.js';

/**
 * Makes an HTTP request using Bun's native fetch API
 *
 * @param url - The URL to request
 * @param init - Fetch options
 * @returns A response-like object compatible with the REST manager
 */
export async function makeRequest(url: string, init: RequestInit): Promise<ResponseLike> {
	const res = await fetch(url, init);

	return {
		body: res.body,
		async arrayBuffer() {
			return res.arrayBuffer();
		},
		async json() {
			return res.json();
		},
		async text() {
			return res.text();
		},
		get bodyUsed() {
			return res.bodyUsed;
		},
		headers: res.headers,
		status: res.status,
		statusText: res.statusText,
		ok: res.ok,
	};
}
