import { setDefaultStrategy } from './environment.js';
import { makeRequest } from './strategies/bunRequest.js';

// Bun provides native fetch() globally, use it unconditionally
setDefaultStrategy(makeRequest);

export * from './shared.js';

