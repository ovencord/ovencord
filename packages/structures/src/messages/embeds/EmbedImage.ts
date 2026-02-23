import type { APIEmbedImage } from 'discord-api-types/v10';
import { Structure } from '../../Structure.js';
import { kData } from '../../utils/symbols.js';

/**
 * Represents image data in an embed on a message.
 *
 * @typeParam Omitted - Specify the properties that will not be stored in the raw data field as a union, implement via `DataTemplate`
 */
export class EmbedImage<Omitted extends keyof APIEmbedImage | '' = ''> extends Structure<APIEmbedImage, Omitted> {
	/**
	 * The height of the image
	 */
	public get height() {
		return this[kData].height;
	}

	/**
	 * The width of the image
	 */
	public get width() {
		return this[kData].width;
	}

	/**
	 * A proxied URL of the image
	 */
	public get proxyURL() {
		return this[kData].proxy_url;
	}

	/**
	 * Source URL of the image
	 */
	public get url() {
		return this[kData].url;
	}
}
