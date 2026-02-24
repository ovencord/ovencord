export interface IDiscordMessageAuthor {
	readonly avatar: string;
	readonly bot?: boolean;
	readonly color?: string;
	readonly time: string;
	readonly username: string;
	readonly verified?: boolean;
}

export function DiscordMessageAuthor({ avatar, bot, verified, color, time, username }: IDiscordMessageAuthor) {
	return (
		<>
			<img
				alt={`${username}'s avatar`}
				class="absolute left-[16px] mt-0.5 h-10 w-10 cursor-pointer select-none rounded-full"
				src={avatar}
			/>
			<h2 class="m-0 flex place-items-center text-size-inherit font-medium leading-snug" id="user-info">
				<span class="inline-flex place-items-center" id="username">
					<span class={`mr-1.5 cursor-pointer text-base font-medium hover:underline ${color ?? 'text-white'}`}>
						{username}
					</span>
					{bot ? (
						<span
							class="mr-1 inline-flex place-items-center rounded bg-blurple px-1 vertical-top text-[0.7rem]/4 text-white font-normal"
							id="bot"
						>
							{verified ? (
								<svg
									class="mr-0.5 inline-block"
									stroke="currentColor"
									fill="none"
									stroke-width="3"
									viewBox="0 0 24 24"
									stroke-linecap="round"
									stroke-linejoin="round"
									height="1em"
									width="1em"
									xmlns="http://www.w3.org/2000/svg"
									role="img"
									aria-label="Verified icon"
								>
									<title>Verified icon</title>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							) : null}{' '}
							BOT
						</span>
					) : null}
				</span>
				<span class="ml-1 cursor-default text-xs text-[rgb(163_166_170)] leading-snug" id="time">
					{time}
				</span>
			</h2>
		</>
	);
}
