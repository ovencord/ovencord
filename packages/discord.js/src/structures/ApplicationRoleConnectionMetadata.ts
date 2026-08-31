import type {
	APIApplicationRoleConnectionMetadata,
	ApplicationRoleConnectionMetadataType,
	LocalizationMap,
} from 'discord-api-types/v10';

/**
 * Role connection metadata object for an application.
 */
export class ApplicationRoleConnectionMetadata {
	/**
	 * The name of this metadata field
	 */
	public name: string;

	/**
	 * The name localizations for this metadata field
	 */
	public nameLocalizations: LocalizationMap | null;

	/**
	 * The description of this metadata field
	 */
	public description: string;

	/**
	 * The description localizations for this metadata field
	 */
	public descriptionLocalizations: LocalizationMap | null;

	/**
	 * The dictionary key for this metadata field
	 */
	public key: string;

	/**
	 * The type of this metadata field
	 */
	public type: ApplicationRoleConnectionMetadataType;

	constructor(data: APIApplicationRoleConnectionMetadata) {
		this.name = data.name;

		this.nameLocalizations = data.name_localizations ?? null;

		this.description = data.description;

		this.descriptionLocalizations = data.description_localizations ?? null;

		this.key = data.key;

		this.type = data.type;
	}
}
