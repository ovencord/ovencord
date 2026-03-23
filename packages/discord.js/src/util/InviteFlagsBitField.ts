import { InviteFlags } from 'discord-api-types/v10';
import { BitField } from './BitField.js';

/**
 * Data structure that makes it easy to interact with a {@link GuildInvite#flags} bit field.
 *
 * @extends {BitField}
 */
export class InviteFlagsBitField extends BitField {
	/**
	 * Numeric invite flags.
	 *
	 * @type {InviteFlags}
	 * @memberof InviteFlagsBitField
	 */
	static override Flags: Record<string, number | bigint> = InviteFlags as unknown as Record<string, number | bigint>;
}

/**
 * @name InviteFlagsBitField
 * @kind constructor
 * @memberof InviteFlagsBitField
 * @param {BitFieldResolvable} [bits=0] Bit(s) to read from
 */
