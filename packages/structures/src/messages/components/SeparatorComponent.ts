import type { APISeparatorComponent } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import { Component } from './Component.js';

/**
 * Represents a separator component on a message.
 *
 * @typeParam Omitted - Specify the properties that will not be stored in the raw data field as a union, implement via `DataTemplate`
 */
export class SeparatorComponent<Omitted extends keyof APISeparatorComponent | '' = ''> extends Component<
	APISeparatorComponent,
	Omitted
> {
	/**
	 * The template used for removing data from the raw data stored for each SeparatorComponent.
	 */
	public static override readonly DataTemplate: Partial<APISeparatorComponent> = {};

	/**
	 * Whether a visual divider should be displayed in the component
	 */
	public get divider() {
		return this[kData].divider;
	}

	/**
	 * The size of the separator padding
	 */
	public get spacing() {
		return this[kData].spacing;
	}
}
