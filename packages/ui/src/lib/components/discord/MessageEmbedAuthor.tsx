export interface IDiscordMessageEmbedAuthor {
	readonly avatar: string;
	readonly url?: string;
	readonly username: string;
}

export function DiscordMessageEmbedAuthor({ avatar, url, username }: IDiscordMessageEmbedAuthor) {
	return (
		<div class="mt-2 flex place-items-center">
			<img alt={`${username}'s avatar`} class="mr-2 h-6 w-6 select-none rounded-full" src={avatar} />
			{url ? (
				<a class="text-sm font-medium hover:underline" href={url} rel="noreferrer noopener external" target="_blank">
					{username}
				</a>
			) : (
				<span class="text-sm font-medium">{username}</span>
			)}
		</div>
	);
}
