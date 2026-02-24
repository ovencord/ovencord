import type { Child } from 'hono/jsx';
import type { IDiscordMessageAuthorReply } from './MessageAuthorReply.js';
import { DiscordMessageBaseReply } from './MessageBaseReply.js';

export interface IDiscordMessageReply {
	readonly author?: IDiscordMessageAuthorReply | undefined;
	readonly authorNode?: Child | undefined;
	readonly content: string;
}

export function DiscordMessageReply({ author, authorNode, content }: IDiscordMessageReply) {
	return (
		<DiscordMessageBaseReply author={author} authorNode={authorNode}>
			<div class="cursor-pointer select-none text-sm text-[rgb(163_166_170)] leading-snug hover:text-white">
				{content}
			</div>
		</DiscordMessageBaseReply>
	);
}
