import type { APIMessageComponentEmoji } from 'discord-api-types/v10';

/**
 * Parses emoji info out of a string. The string must be one of:
 * - A UTF-8 emoji (no id)
 * - A URL-encoded UTF-8 emoji (no id)
 * - A Discord custom emoji (`<:name:id>` or `<a:name:id>`)
 *
 * @param text - Emoji string to parse
 * @returns The parsed emoji data
 */
export function parseEmoji(text: string): APIMessageComponentEmoji {
	const decodedText = text.includes('%') ? decodeURIComponent(text) : text;
	if (!decodedText.includes(':')) return { animated: false, name: decodedText.replace(/\uFE0F/g, ''), id: undefined };
	const match = /<?(?:(?<animated>a):)?(?<name>\w{2,32}):(?<id>\d{17,19})?>?/.exec(decodedText);
	
    if (!match || !match.groups) {
        return { animated: false, name: decodedText, id: undefined };
    }

	return {
		animated: Boolean(match.groups.animated),
		name: match.groups.name,
		id: match.groups.id,
	};
}
