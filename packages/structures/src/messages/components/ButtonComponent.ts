import type { APIButtonComponent, APIButtonComponentWithCustomId, ButtonStyle } from 'discord-api-types/v10';
import { kData } from '../../utils/symbols.js';
import { Component } from './Component.js';

/**
 * The data stored by a {@link ButtonComponent} structure based on its {@link (ButtonComponent:class)."style"} property.
 */
export type ButtonDataType<Style extends ButtonStyle> = Style extends
	| ButtonStyle.Danger
	| ButtonStyle.Primary
	| ButtonStyle.Secondary
	| ButtonStyle.Success
	? APIButtonComponentWithCustomId
	: Extract<APIButtonComponent, { style: Style }>;

export abstract class ButtonComponent<
	Style extends ButtonStyle,
	Omitted extends keyof ButtonDataType<Style> | '' = '',
> extends Component<ButtonDataType<Style>, Omitted> {
	/**
	 * The style of the button
	 */
	public get style() {
		return this[kData].style;
	}

	/**
	 * The status of the button
	 */
	public get disabled() {
		return typeof this[kData].disabled === 'boolean' ? this[kData].disabled : null;
	}
}
