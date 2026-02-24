import type { Child } from 'hono/jsx';

export interface IDiscordMessages {
	readonly rounded?: boolean;
	readonly children?: Child;
}

export function DiscordMessages({ rounded, children }: IDiscordMessages) {
	return (
		<div
			class={`font-source-sans-pro bg-[rgb(54_57_63)] pb-4 pt-0.1 ${rounded ? 'rounded' : ''}`}
			id="messages-wrapper"
		>
			{children}
		</div>
	);
}
