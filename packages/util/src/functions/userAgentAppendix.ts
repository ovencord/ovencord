

/**
 * Resolves the user agent appendix string for the current environment.
 */
export function getUserAgentAppendix(): string {
	// https://vercel.com/docs/concepts/functions/edge-functions/edge-runtime#check-if-you're-running-on-the-edge-runtime
	if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
		return 'Vercel-Edge-Functions';
	}
 
	// Cloudflare Workers
	if (typeof (globalThis as any).R2 !== 'undefined' && typeof (globalThis as any).WebSocketPair !== 'undefined') {
		// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
		return 'Cloudflare-Workers';
	}
 
	// https://docs.netlify.com/edge-functions/api/#netlify-global-object
	if (typeof (globalThis as any).Netlify !== 'undefined') {
		return 'Netlify-Edge-Functions';
	}
 
	// Most (if not all) edge environments will have `process` defined. Within a web browser we'll extract it using `navigator.userAgent`.
	if (typeof (globalThis as any).process !== 'object') {
		if (typeof (globalThis as any).navigator === 'object') {
			return (globalThis as any).navigator.userAgent;
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
