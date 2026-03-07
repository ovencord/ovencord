import type { APITextDisplayComponent } from 'discord-api-types/v10';
import { Component } from './Component.js';

/**
 * Represents a text display component
 *
 * @extends {Component}
 */
export class TextDisplayComponent extends Component {
	/**
	 * The content of this text display
	 *
	 * @type {string}
	 * @readonly
	 */
	get content() {
		return (this.data as unknown as APITextDisplayComponent).content;
	}
}
