interface Methods {
	crypto_aead_xchacha20poly1305_ietf_decrypt(
		cipherText: Uint8Array,
		additionalData: Uint8Array,
		nonce: Uint8Array,
		key: Uint8Array,
	): Uint8Array;
	crypto_aead_xchacha20poly1305_ietf_encrypt(
		plaintext: Uint8Array,
		additionalData: Uint8Array,
		nonce: Uint8Array,
		key: Uint8Array,
	): Uint8Array;
}

const libs = {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic library imports
	'sodium-native': (sodium: any): Methods => ({
		crypto_aead_xchacha20poly1305_ietf_decrypt: (
			cipherText: Uint8Array,
			additionalData: Uint8Array,
			nonce: Uint8Array,
			key: Uint8Array,
		) => {
			const message = new Uint8Array(cipherText.length - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES);
			sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(message, null, cipherText, additionalData, nonce, key);
			return message;
		},
		crypto_aead_xchacha20poly1305_ietf_encrypt: (
			plaintext: Uint8Array,
			additionalData: Uint8Array,
			nonce: Uint8Array,
			key: Uint8Array,
		) => {
			const cipherText = new Uint8Array(plaintext.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES);
			sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(cipherText, plaintext, additionalData, null, nonce, key);
			return cipherText;
		},
	}),
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic library imports
	sodium: (sodium: any): Methods => ({
		crypto_aead_xchacha20poly1305_ietf_decrypt: (
			cipherText: Uint8Array,
			additionalData: Uint8Array,
			nonce: Uint8Array,
			key: Uint8Array,
		) => sodium.api.crypto_aead_xchacha20poly1305_ietf_decrypt(cipherText, additionalData, null, nonce, key),
		crypto_aead_xchacha20poly1305_ietf_encrypt: (
			plaintext: Uint8Array,
			additionalData: Uint8Array,
			nonce: Uint8Array,
			key: Uint8Array,
		) => sodium.api.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, additionalData, null, nonce, key),
	}),
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic library imports
	'libsodium-wrappers': (sodium: any): Methods => ({
		crypto_aead_xchacha20poly1305_ietf_decrypt: (
			cipherText: Uint8Array,
			additionalData: Uint8Array,
			nonce: Uint8Array,
			key: Uint8Array,
		) => sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, cipherText, additionalData, nonce, key),
		crypto_aead_xchacha20poly1305_ietf_encrypt: (
			plaintext: Uint8Array,
			additionalData: Uint8Array,
			nonce: Uint8Array,
			key: Uint8Array,
		) => sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, additionalData, null, nonce, key),
	}),
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic library imports
	'@stablelib/xchacha20poly1305': (stablelib: any): Methods => ({
		crypto_aead_xchacha20poly1305_ietf_decrypt(plaintext, additionalData, nonce, key) {
			const crypto = new stablelib.XChaCha20Poly1305(key);
			return crypto.open(nonce, plaintext, additionalData);
		},
		crypto_aead_xchacha20poly1305_ietf_encrypt(cipherText, additionalData, nonce, key) {
			const crypto = new stablelib.XChaCha20Poly1305(key);
			return crypto.seal(nonce, cipherText, additionalData);
		},
	}),
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic library imports
	'@noble/ciphers/chacha.js': (noble: any): Methods => ({
		crypto_aead_xchacha20poly1305_ietf_decrypt(cipherText, additionalData, nonce, key) {
			const chacha = noble.xchacha20poly1305(key, nonce, additionalData);
			return chacha.decrypt(cipherText);
		},
		crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, additionalData, nonce, key) {
			const chacha = noble.xchacha20poly1305(key, nonce, additionalData);
			return chacha.encrypt(plaintext);
		},
	}),
} as const;

const fallbackError = () => {
	throw new Error(
		`Cannot play audio as no valid encryption package is installed.
- Install one of:
  - sodium
  - libsodium-wrappers
  - @stablelib/xchacha20poly1305
  - @noble/ciphers.
- Use the generateDependencyReport() function for more information.\n`,
	);
};

const methods: Methods = {
	crypto_aead_xchacha20poly1305_ietf_encrypt: fallbackError,
	crypto_aead_xchacha20poly1305_ietf_decrypt: fallbackError,
};

export const secretboxLoadPromise = new Promise<void>((resolve) => {
	(async () => {
		for (const libName of Object.keys(libs) as (keyof typeof libs)[]) {
			try {
				const lib = await import(libName);

				if (libName === 'libsodium-wrappers' && lib.ready) {
					await lib.ready;
				}

				Object.assign(methods, libs[libName](lib));

				break;
			} catch {}
		}

		resolve();
	})();
});

export { methods };
