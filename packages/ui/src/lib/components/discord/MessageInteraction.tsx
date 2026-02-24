import type { Child } from 'hono/jsx';
import type { IDiscordMessageAuthorReply } from './MessageAuthorReply.js';
import { DiscordMessageBaseReply } from './MessageBaseReply.js';

export interface IDiscordMessageInteraction {
	readonly author?: IDiscordMessageAuthorReply | undefined;
	readonly authorNode?: Child | undefined;
	readonly command?: string;
}

export function DiscordMessageInteraction({ author, authorNode, command }: IDiscordMessageInteraction) {
	return (
		<DiscordMessageBaseReply author={author} authorNode={authorNode}>
			<span class="mr-1 select-none text-sm text-white leading-snug">used</span>
			<div class="cursor-pointer text-sm text-blurple leading-snug hover:underline">{command}</div>
		</DiscordMessageBaseReply>
	);
}
