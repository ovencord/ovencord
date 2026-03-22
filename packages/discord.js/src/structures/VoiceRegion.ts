import { flatten } from '../util/Util.js';

/**
 * Represents a Discord voice region for guilds.
 */
export class VoiceRegion {
	public id: string;
	public name: string;
	public deprecated: boolean;
	public optimal: boolean;
	public custom: boolean;
	constructor(data: Record<string, unknown>) {
		/**
		 * The region's id
		 *
		 * @type {string}
		 */
		this.id = data.id as string;

		/**
		 * Name of the region
		 *
		 * @type {string}
		 */
		this.name = data.name as string;

		/**
		 * Whether the region is deprecated
		 *
		 * @type {boolean}
		 */
		this.deprecated = data.deprecated as boolean;

		/**
		 * Whether the region is optimal
		 *
		 * @type {boolean}
		 */
		this.optimal = data.optimal as boolean;

		/**
		 * Whether the region is custom
		 *
		 * @type {boolean}
		 */
		this.custom = data.custom as boolean;
	}

	toJSON() {
		return flatten(this);
	}
}
