export function createEnum(keys: any) {
	const obj = {};
	for (const [index, key] of keys.entries()) {
		if (key === null) continue;
		// @ts-expect-error
		obj[key] = index;
		// @ts-expect-error
		obj[index] = key;
	}

	return obj;
}
