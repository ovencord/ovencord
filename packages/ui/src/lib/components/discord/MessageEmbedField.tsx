export interface IDiscordMessageEmbedField {
	readonly inline?: boolean;
	readonly name: string;
	readonly value: string;
}

export function DiscordMessageEmbedField({ name, value, inline }: IDiscordMessageEmbedField) {
	return (
		<div class={`${inline ? 'sm:col-span-4' : 'sm:col-span-12'} flex flex-col`}>
			<span class="font-medium">{name}</span>
			<span class="text-gray-300">{value}</span>
		</div>
	);
}
