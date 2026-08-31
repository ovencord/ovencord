import type { APISKU, SKUType, Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { SKUFlagsBitField } from '../util/SKUFlagsBitField.js';
import { Base } from './Base.js';

/**
 * Represents a premium application SKU.
 *
 * @extends {Base}
 */
export class SKU extends Base {
	public id: Snowflake;
	public type: SKUType;
	public applicationId: Snowflake;
	public name: string;
	public slug: string;
	public flags: Readonly<SKUFlagsBitField>;
	constructor(client: Client, data: APISKU) {
		super(client);

		/**
		 * The id of the SKU
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id;

		/**
		 * The type of the SKU
		 *
		 * @type {SKUType}
		 */
		this.type = data.type;

		/**
		 * The id of the parent application
		 *
		 * @type {Snowflake}
		 */
		this.applicationId = data.application_id;

		/**
		 * The customer-facing name of the premium offering
		 *
		 * @type {string}
		 */
		this.name = data.name;

		/**
		 * The system-generated URL slug based on this SKU's name
		 *
		 * @type {string}
		 */
		this.slug = data.slug;

		/**
		 * Flags that describe the SKU
		 *
		 * @type {Readonly<SKUFlagsBitField>}
		 */
		this.flags = new SKUFlagsBitField(data.flags).freeze();
	}
}
