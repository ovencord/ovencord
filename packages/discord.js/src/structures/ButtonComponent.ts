import type { APIButtonComponent, APIMessageComponentEmoji } from 'discord-api-types/v10';
import { Component } from './Component.js';

/**
 * Represents a button component
 *
 * @extends {Component}
 */
export class ButtonComponent extends Component {
	/**
	 * The style of this button
	 *
	 * @type {ButtonStyle}
	 * @readonly
	 */
	get style() {
		return (this.data as APIButtonComponent).style;
	}

	/**
	 * The label of this button
	 *
	 * @type {?string}
	 * @readonly
	 */
	get label() {
		return (this.data as unknown as { label?: string }).label ?? null;
	}

	/**
	 * The emoji used in this button
	 *
	 * @type {?APIMessageComponentEmoji}
	 * @readonly
	 */
	get emoji() {
		return (this.data as unknown as { emoji?: APIMessageComponentEmoji }).emoji ?? null;
	}

	/**
	 * Whether this button is disabled
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get disabled() {
		return (this.data as unknown as { disabled?: boolean }).disabled ?? false;
	}

	/**
	 * The custom id of this button (only defined on non-link buttons)
	 *
	 * @type {?string}
	 * @readonly
	 */
	get customId() {
		return (this.data as unknown as { custom_id?: string }).custom_id ?? null;
	}

	/**
	 * The URL of this button (only defined on link buttons)
	 *
	 * @type {?string}
	 * @readonly
	 */
	get url() {
		return (this.data as unknown as { url?: string }).url ?? null;
	}
}
