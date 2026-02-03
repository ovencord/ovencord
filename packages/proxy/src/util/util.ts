import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Awaitable } from '@ovencord/util';

/**
 * Represents a simple HTTP request handler
 */
export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => Awaitable<void>;
