import type { APITextDisplayComponent } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import { Component } from './Component.js';

/**
 * Represents a text display component on a message.
 *
 * @typeParam Omitted - Specify the properties that will not be stored in the raw data field as a union, implement via `DataTemplate`
 */
export class TextDisplayComponent<Omitted extends keyof APITextDisplayComponent | '' = ''> extends Component<
	APITextDisplayComponent,
	Omitted
> {
	/**
	 * The template used for removing data from the raw data stored for each TextDisplayComponent.
	 */
	public static override readonly DataTemplate: Partial<APITextDisplayComponent> = {};

	/**
	 * Text that will be displayed similar to a message
	 */
	public get content() {
		return this[kData].content;
	}
}
