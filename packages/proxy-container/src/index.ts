import { createServer } from 'node:http';
import process from 'node:process';
import { proxyRequests } from '@ovencord/proxy';
import { REST } from '@ovencord/rest';

process.on('SIGINT', () => process.exit(0));

// We want to let upstream handle retrying
const api = new REST({ rejectOnRateLimit: () => true, retries: 0 });
const server = createServer(proxyRequests(api));

const port = Number.parseInt(process.env.PORT ?? '8080', 10);
server.listen(port, () => console.log(`Listening on port ${port}`));
