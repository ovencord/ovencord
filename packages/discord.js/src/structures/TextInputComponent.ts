import type { APITextInputComponent } from 'discord-api-types/v10';
import { Component } from './Component.js';

/**
 * Represents a text input component.
 *
 * @extends {Component}
 */
export class TextInputComponent extends Component {
	/**
	 * The custom id of this text input
	 *
	 * @type {string}
	 * @readonly
	 */
	get customId() {
		return (this.data as unknown as APITextInputComponent).custom_id;
	}

	/**
	 * The value for this text input
	 *
	 * @type {string}
	 * @readonly
	 */
	get value() {
		return (this.data as unknown as APITextInputComponent).value ?? null;
	}
}
