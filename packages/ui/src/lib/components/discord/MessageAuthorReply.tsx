export interface IDiscordMessageAuthorReply {
	readonly avatar: string;
	readonly bot?: boolean;
	readonly color?: string;
	readonly username: string;
	readonly verified?: boolean;
}

export function DiscordMessageAuthorReply({ avatar, bot, verified, color, username }: IDiscordMessageAuthorReply) {
	return (
		<>
			<img alt={`${username}'s avatar`} class="mr-1.5 h-4 w-4 select-none rounded-full" src={avatar} />
			{bot ? (
				<div
					class="mr-1 inline-flex place-items-center rounded bg-blurple px-1 vertical-top text-[0.7rem]/4 text-white font-normal"
					id="bot"
				>
					{verified ? (
						<svg class="mr-0.5 inline-block" stroke="currentColor" fill="none" stroke-width="3" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					) : null} BOT
				</div>
			) : null}
			<span class={`mr-1 cursor-pointer select-none text-sm font-medium leading-snug ${color ?? 'text-white'}`}>
				{username}
			</span>
		</>
	);
}
