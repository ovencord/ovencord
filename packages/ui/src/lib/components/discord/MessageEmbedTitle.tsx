export interface IDiscordMessageEmbedTitle {
	readonly title: string;
	readonly url?: string;
}

export function DiscordMessageEmbedTitle({ title, url }: IDiscordMessageEmbedTitle) {
	return url ? (
		<a
			class="mt-2 text-blue-500 font-medium hover:underline"
			href={url}
			rel="noreferrer noopener external"
			target="_blank"
		>
			{title}
		</a>
	) : (
		<div class="mt-2 font-medium">{title}</div>
	);
}
