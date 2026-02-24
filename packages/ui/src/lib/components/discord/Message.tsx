import type { Child } from 'hono/jsx';
import { DiscordMessageAuthor, type IDiscordMessageAuthor } from './MessageAuthor.js';
import { DiscordMessageInteraction, type IDiscordMessageInteraction } from './MessageInteraction.js';
import { DiscordMessageReply, type IDiscordMessageReply } from './MessageReply.js';

export interface IDiscordMessage {
	readonly author?: IDiscordMessageAuthor | undefined;
	readonly authorNode?: Child | undefined;
	readonly followUp?: boolean;
	readonly interaction?: IDiscordMessageInteraction | undefined;
	readonly interactionNode?: Child | undefined;
	readonly reply?: IDiscordMessageReply | undefined;
	readonly replyNode?: Child | undefined;
	readonly time?: string | undefined;
	readonly children?: Child;
}

export function DiscordMessage({
	reply,
	replyNode,
	interaction,
	interactionNode,
	author,
	authorNode,
	followUp,
	time,
	children,
}: IDiscordMessage) {
	return (
		<div class="relative" id="outer-message-wrapper">
			<div
				class={`group py-0.5 pl-18 pr-12 leading-snug hover:bg-[rgb(4_4_5)]/7 ${followUp ? '' : 'mt-4'}`}
				id="message-wrapper"
			>
				{(reply || replyNode) && !followUp ? reply ? <DiscordMessageReply {...reply} /> : (replyNode ?? null) : null}
				{(interaction || interactionNode) && !(reply || replyNode) && !followUp ? (
					interaction ? (
						<DiscordMessageInteraction {...interaction} />
					) : (
						(interactionNode ?? null)
					)
				) : null}
				<div class="static" id="content-wrapper">
					{followUp ? (
						<span
							class="absolute left-0 mr-1 hidden h-5.5 w-[56px] cursor-default select-none text-right text-xs text-[rgb(163_166_170)] leading-loose group-hover:inline-block"
							id="time"
						>
							{time}
						</span>
					) : author ? (
						<DiscordMessageAuthor {...author} />
					) : (
						authorNode
					)}
					<div class="text-white [&>p]:m-0 [&>p]:leading-snug" id="message-content">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
