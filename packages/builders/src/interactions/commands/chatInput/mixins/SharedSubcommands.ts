import type { RestOrArray } from '../../../../util/normalizeArray.js';
import { normalizeArray } from '../../../../util/normalizeArray.js';
import { resolveBuilder } from '../../../../util/resolveBuilder.js';
import {
	ChatInputCommandSubcommandGroupBuilder,
	ChatInputCommandSubcommandBuilder,
} from '../ChatInputCommandSubcommands.js';

export interface SharedChatInputCommandSubcommandsData {
	options?: (ChatInputCommandSubcommandBuilder | ChatInputCommandSubcommandGroupBuilder)[];
}

/**
 * This mixin holds symbols that can be shared in chat input subcommands.
 */
export class SharedChatInputCommandSubcommands {
	/**
	 * @internal
	 */
	declare protected readonly data: SharedChatInputCommandSubcommandsData;

	/**
	 * Adds subcommand groups to this command.
	 *
	 * @param input - Subcommand groups to add
	 */
	public addSubcommandGroups(
		...input: RestOrArray<
			| ChatInputCommandSubcommandGroupBuilder
			| ((subcommandGroup: ChatInputCommandSubcommandGroupBuilder) => ChatInputCommandSubcommandGroupBuilder)
		>
	): this {
		const normalized = normalizeArray(input);
		const resolved = normalized.map((value) => resolveBuilder(value, ChatInputCommandSubcommandGroupBuilder));

		this.data.options ??= [];
		this.data.options.push(...resolved);

		return this;
	}

	/**
	 * Adds a subcommand group to this command.
	 *
	 * @param input - Subcommand group to add
	 */
	public addSubcommandGroup(
		input:
			| ChatInputCommandSubcommandGroupBuilder
			| ((subcommandGroup: ChatInputCommandSubcommandGroupBuilder) => ChatInputCommandSubcommandGroupBuilder),
	): this {
		return this.addSubcommandGroups(input);
	}

	/**
	 * Adds subcommands to this command.
	 *
	 * @param input - Subcommands to add
	 */
	public addSubcommands(
		...input: RestOrArray<
			| ChatInputCommandSubcommandBuilder
			| ((subcommandGroup: ChatInputCommandSubcommandBuilder) => ChatInputCommandSubcommandBuilder)
		>
	): this {
		const normalized = normalizeArray(input);
		const resolved = normalized.map((value) => resolveBuilder(value, ChatInputCommandSubcommandBuilder));

		this.data.options ??= [];
		this.data.options.push(...resolved);

		return this;
	}

	/**
	 * Adds a subcommand to this command.
	 *
	 * @param input - Subcommand to add
	 */
	public addSubcommand(
		input:
			| ChatInputCommandSubcommandBuilder
			| ((subcommandGroup: ChatInputCommandSubcommandBuilder) => ChatInputCommandSubcommandBuilder),
	): this {
		return this.addSubcommands(input);
	}
}
