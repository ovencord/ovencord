import type { Child } from 'hono/jsx';
import { DiscordMessageEmbedAuthor, type IDiscordMessageEmbedAuthor } from './MessageEmbedAuthor.js';
import type { IDiscordMessageEmbedField } from './MessageEmbedField.js';
import { DiscordMessageEmbedFields } from './MessageEmbedFields.js';
import { DiscordMessageEmbedFooter, type IDiscordMessageEmbedFooter } from './MessageEmbedFooter.js';
import { DiscordMessageEmbedImage, type IDiscordMessageEmbedImage } from './MessageEmbedImage.js';
import { DiscordMessageEmbedThumbnail, type IDiscordMessageEmbedThumbnail } from './MessageEmbedThumbnail.js';
import { DiscordMessageEmbedTitle, type IDiscordMessageEmbedTitle } from './MessageEmbedTitle.js';

export interface IDiscordMessageEmbed {
	readonly author?: IDiscordMessageEmbedAuthor | undefined;
	readonly authorNode?: Child | undefined;
	readonly fields?: IDiscordMessageEmbedField[];
	readonly footer?: IDiscordMessageEmbedFooter | undefined;
	readonly footerNode?: Child | undefined;
	readonly image?: IDiscordMessageEmbedImage;
	readonly thumbnail?: IDiscordMessageEmbedThumbnail;
	readonly title?: IDiscordMessageEmbedTitle | undefined;
	readonly titleNode?: Child | undefined;
	readonly children?: Child;
}

export function DiscordMessageEmbed({
	author,
	authorNode,
	fields,
	title,
	titleNode,
	image,
	children,
	thumbnail,
	footer,
	footerNode,
}: IDiscordMessageEmbed) {
	return (
		<div class="py-0.5" id="outer-embed-wrapper">
			<div class="grid max-w-max border-l-4 border-l-blurple rounded bg-[rgb(47_49_54)]" id="embed-wrapper">
				<div class="max-w-128 flex">
					<div class="pb-4 pl-3 pr-4 pt-2">
						{author ? <DiscordMessageEmbedAuthor {...author} /> : (authorNode ?? null)}
						{title ? <DiscordMessageEmbedTitle {...title} /> : (titleNode ?? null)}
						{children ? <div class="mt-2 text-sm">{children}</div> : null}
						{fields ? <DiscordMessageEmbedFields fields={fields} /> : null}
						{image ? <DiscordMessageEmbedImage {...image} /> : null}
						{footer ? <DiscordMessageEmbedFooter {...footer} /> : (footerNode ?? null)}
					</div>

					{thumbnail ? <DiscordMessageEmbedThumbnail {...thumbnail} /> : null}
				</div>
			</div>
		</div>
	);
}
