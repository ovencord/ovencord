import { ButtonStyle, ComponentType, type APIButtonComponent } from 'discord-api-types/v10';
import { Mixin } from 'ts-mixer';
import { BaseButtonBuilder } from './Button.js';
import { EmojiOrLabelButtonMixin } from './mixins/EmojiOrLabelButtonMixin.js';

/**
 * A builder that creates API-compatible JSON data for buttons.
 *
 * @mixes {@link BaseButtonBuilder}\<{@link discord-api-types/v10#(APIButtonComponent:interface)}\>
 * @mixes {@link EmojiOrLabelButtonMixin}
 */
// @ts-ignore
export interface ButtonBuilder extends BaseButtonBuilder<APIButtonComponent>, EmojiOrLabelButtonMixin {}

export class ButtonBuilder extends Mixin(BaseButtonBuilder<APIButtonComponent>, EmojiOrLabelButtonMixin) {
	/**
	 * @internal
	 */
	protected override readonly data: Partial<APIButtonComponent>;

	/**
	 * Creates a new button builder.
	 *
	 * @param data - The API data to create this button with
	 */
	public constructor(data: Partial<APIButtonComponent> = {}) {
		super();
		this.data = { ...structuredClone(data), type: ComponentType.Button };
	}

	/**
	 * Sets the custom id for this button.
	 *
	 * @param customId - The custom id to use
	 */
	public setCustomId(customId: string) {
		(this.data as any).custom_id = customId;
		return this;
	}

	/**
	 * Sets the style for this button.
	 *
	 * @param style - The style to use
	 */
	public setStyle(style: ButtonStyle) {
		(this.data as any).style = style;
		return this;
	}

	/**
	 * Sets the URL for this button.
	 *
	 * @param url - The URL to use
	 */
	public setURL(url: string) {
		(this.data as any).url = url;
		return this;
	}

	/**
	 * Sets the SKU id for this button.
	 *
	 * @param skuId - The SKU id to use
	 */
	public setSKUId(skuId: string) {
		(this.data as any).sku_id = skuId;
		return this;
	}
}
