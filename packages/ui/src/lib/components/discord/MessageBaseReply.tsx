import type { Child } from 'hono/jsx';
import { DiscordMessageAuthorReply, type IDiscordMessageAuthorReply } from './MessageAuthorReply.js';

export function DiscordMessageBaseReply({
	author,
	authorNode,
	children,
}: {
	readonly author?: IDiscordMessageAuthorReply | undefined;
	readonly authorNode?: Child | undefined;
	readonly children?: Child;
}) {
	return (
		<div
			class="relative mb-1 flex place-items-center before:absolute before:bottom-0 before:left-[-36px] before:right-full before:top-[50%] before:mr-1 before:block before:border-l-2 before:border-t-2 before:border-[rgb(79_84_92)] before:rounded-tl-1.5 before:content-none"
			id="reply-wrapper"
		>
			<div class="flex place-items-center [&>span]:opacity-60">
				{author ? <DiscordMessageAuthorReply {...author} /> : authorNode}
			</div>
			{children}
		</div>
	);
}
