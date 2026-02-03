

/**
 * Resolves the user agent appendix string for the current environment.
 */
export function getUserAgentAppendix(): string {
	// https://vercel.com/docs/concepts/functions/edge-functions/edge-runtime#check-if-you're-running-on-the-edge-runtime
	// @ts-expect-error Vercel Edge functions
	if (typeof globalThis.EdgeRuntime !== 'undefined') {
		return 'Vercel-Edge-Functions';
	}

	// @ts-expect-error Cloudflare Workers
	if (typeof globalThis.R2 !== 'undefined' && typeof globalThis.WebSocketPair !== 'undefined') {
		// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
		return 'Cloudflare-Workers';
	}

	// https://docs.netlify.com/edge-functions/api/#netlify-global-object
	// @ts-expect-error Netlify Edge functions
	if (typeof globalThis.Netlify !== 'undefined') {
		return 'Netlify-Edge-Functions';
	}

	// Most (if not all) edge environments will have `process` defined. Within a web browser we'll extract it using `navigator.userAgent`.
	if (typeof globalThis.process !== 'object') {
		if (typeof globalThis.navigator === 'object') {
			return globalThis.navigator.userAgent;
		}

		return 'UnknownEnvironment';
	}

	const versions = (globalThis.process as any).versions;
	if (versions) {
		if ('deno' in versions) {
			return `Deno/${versions.deno}`;
		}

		if ('bun' in versions) {
			return `Bun/${versions.bun}`;
		}

		if ('node' in versions) {
			return `Node.js/${versions.node}`;
		}
	}

	return 'UnknownEnvironment';
}
