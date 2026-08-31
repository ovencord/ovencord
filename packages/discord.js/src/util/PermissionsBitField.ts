import { PermissionFlagsBits } from 'discord-api-types/v10';
import { BitField, type BitFieldResolvable } from './BitField.js';

export type PermissionsString = keyof typeof PermissionFlagsBits;
export type PermissionResolvable = BitFieldResolvable<PermissionsString, bigint>;

/**
 * Data structure that makes it easy to interact with a permission bitfield. All {@link GuildMember}s have a set of
 * permissions in their guild, and each channel in the guild may also have {@link PermissionOverwrites} for the member
 * that override their default permissions.
 *
 * @extends {BitField}
 */
export class PermissionsBitField extends BitField {
	/**
	 * Numeric permission flags.
	 *
	 * @type {PermissionFlagsBits}
	 * @memberof PermissionsBitField
	 * @see {@link https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags}
	 */
	static override Flags = PermissionFlagsBits;

	/**
	 * Bitfield representing every permission combined
	 *
	 * @type {bigint}
	 * @memberof PermissionsBitField
	 */
	static All = Object.values(PermissionFlagsBits).reduce((all, perm) => all | perm, 0n);

	/**
	 * Bitfield representing the default permissions for users
	 *
	 * @type {bigint}
	 * @memberof PermissionsBitField
	 */
	static Default = BigInt(104_324_673);

	/**
	 * Bitfield representing the permissions required for moderators of stage channels
	 *
	 * @type {bigint}
	 * @memberof PermissionsBitField
	 */
	static StageModerator =
		PermissionFlagsBits.ManageChannels | PermissionFlagsBits.MuteMembers | PermissionFlagsBits.MoveMembers;

	/**
	 * @type {bigint}
	 * @memberof PermissionsBitField
	 * @private
	 */
	static override DefaultBit = BigInt(0);

	/**
	 * Bitfield of the packed bits
	 *
	 * @type {bigint}
	 * @name PermissionsBitField#bitfield
	 */
	public declare bitfield: bigint;

	/**
	 * Gets all given bits that are missing from the bitfield.
	 *
	 * @param {BitFieldResolvable} bits Bit(s) to check for
	 * @param {boolean} [checkAdmin=true] Whether to allow the administrator permission to override
	 * @returns {string[]}
	 */
	override missing(bits: BitFieldResolvable<PermissionsString, bigint>, checkAdmin = true): string[] {
		return checkAdmin && this.has(PermissionFlagsBits.Administrator) ? [] : super.missing(bits);
	}

	/**
	 * Checks whether the bitfield has a permission, or any of multiple permissions.
	 *
	 * @param {PermissionResolvable} permission Permission(s) to check for
	 * @param {boolean} [checkAdmin=true] Whether to allow the administrator permission to override
	 * @returns {boolean}
	 */
	override any(permission: PermissionResolvable, checkAdmin = true): boolean {
		return (checkAdmin && super.has(PermissionFlagsBits.Administrator)) || super.any(permission);
	}

	/**
	 * Checks whether the bitfield has a permission, or multiple permissions.
	 *
	 * @param {PermissionResolvable} permission Permission(s) to check for
	 * @param {boolean} [checkAdmin=true] Whether to allow the administrator permission to override
	 * @returns {boolean}
	 */
	override has(permission: PermissionResolvable, checkAdmin = true): boolean {
		return (checkAdmin && super.has(PermissionFlagsBits.Administrator)) || super.has(permission);
	}

	/**
	 * Gets an {@link Array} of bitfield names based on the permissions available.
	 *
	 * @returns {string[]}
	 */
	override toArray(): PermissionsString[] {
		return super.toArray(false) as PermissionsString[];
	}
}
