export function createEnum(keys: any) {
  const obj = {};
  for (const [index, key] of keys.entries()) {
    if (key === null) continue;
    // @ts-ignore
    obj[key] = index;
    // @ts-ignore
    obj[index] = key;
  }

  return obj;
}
