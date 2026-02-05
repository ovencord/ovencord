import type {
	APIBaseComponent,
	APIButtonComponent,
	APIMessageComponent,
	APIModalComponent,
	APISectionAccessoryComponent,
} from 'discord-api-types/v10';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { ActionRowBuilder } from './ActionRow.js';
import { ComponentBuilder } from './Component.js';
import {
	DangerButtonBuilder,
	PrimaryButtonBuilder,
	SecondaryButtonBuilder,
	SuccessButtonBuilder,
} from './button/CustomIdButton.js';
import { ButtonBuilder } from './button/ButtonBuilder.js';
export { ButtonBuilder };
import { LinkButtonBuilder } from './button/LinkButton.js';
import { PremiumButtonBuilder } from './button/PremiumButton.js';
import { FileUploadBuilder } from './fileUpload/FileUpload.js';
import { LabelBuilder } from './label/Label.js';
import { ChannelSelectMenuBuilder } from './selectMenu/ChannelSelectMenu.js';
import { MentionableSelectMenuBuilder } from './selectMenu/MentionableSelectMenu.js';
import { RoleSelectMenuBuilder } from './selectMenu/RoleSelectMenu.js';
import { StringSelectMenuBuilder } from './selectMenu/StringSelectMenu.js';
import { UserSelectMenuBuilder } from './selectMenu/UserSelectMenu.js';
import { TextInputBuilder } from './textInput/TextInput.js';
import { ContainerBuilder } from './v2/Container.js';
import { FileBuilder } from './v2/File.js';
import { MediaGalleryBuilder } from './v2/MediaGallery.js';
import { SectionBuilder } from './v2/Section.js';
import { SeparatorBuilder } from './v2/Separator.js';
import { TextDisplayBuilder } from './v2/TextDisplay.js';
import { ThumbnailBuilder } from './v2/Thumbnail.js';

/**
 * The builders that may be used as top-level components on messages
 */
export type MessageTopLevelComponentBuilder =
	| ActionRowBuilder
	| ContainerBuilder
	| FileBuilder
	| MediaGalleryBuilder
	| SectionBuilder
	| SeparatorBuilder
	| TextDisplayBuilder;

/**
 * The builders that may be used for messages.
 */
export type MessageComponentBuilder =
	| MessageActionRowComponentBuilder
	| MessageTopLevelComponentBuilder
	| ThumbnailBuilder;

/**
 * The builders that may be used for modals.
 */
export type ModalComponentBuilder =
	| ActionRowBuilder
	| FileUploadBuilder
	| LabelBuilder
	| ModalActionRowComponentBuilder;

// Any button builder is already covered by the ButtonBuilder class

/**
 * The builders that may be used within an action row for messages.
 */
export type MessageActionRowComponentBuilder =
	| ButtonBuilder
	| PrimaryButtonBuilder
	| SecondaryButtonBuilder
	| SuccessButtonBuilder
	| DangerButtonBuilder
	| LinkButtonBuilder
	| PremiumButtonBuilder
	| ChannelSelectMenuBuilder
	| MentionableSelectMenuBuilder
	| RoleSelectMenuBuilder
	| StringSelectMenuBuilder
	| UserSelectMenuBuilder;

/**
 * The builders that may be used within an action row for modals.
 */
export type ModalActionRowComponentBuilder = TextInputBuilder;

/**
 * Any action row component builder.
 */
export type AnyActionRowComponentBuilder = MessageActionRowComponentBuilder | ModalActionRowComponentBuilder;

/**
 * Any modal component builder.
 */
export type AnyModalComponentBuilder = FileUploadBuilder | LabelBuilder | TextDisplayBuilder;

/**
 * Components here are mapped to their respective builder.
 */
export interface MappedComponentTypes {
	/**
	 * The action row component type is associated with an {@link ActionRowBuilder}.
	 */
	[ComponentType.ActionRow]: ActionRowBuilder;
	/**
	 * The button component type is associated with a {@link BaseButtonBuilder}.
	 */
	[ComponentType.Button]: ButtonBuilder;
	/**
	 * The string select component type is associated with a {@link StringSelectMenuBuilder}.
	 */
	[ComponentType.StringSelect]: StringSelectMenuBuilder;
	/**
	 * The text input component type is associated with a {@link TextInputBuilder}.
	 */
	[ComponentType.TextInput]: TextInputBuilder;
	/**
	 * The user select component type is associated with a {@link UserSelectMenuBuilder}.
	 */
	[ComponentType.UserSelect]: UserSelectMenuBuilder;
	/**
	 * The role select component type is associated with a {@link RoleSelectMenuBuilder}.
	 */
	[ComponentType.RoleSelect]: RoleSelectMenuBuilder;
	/**
	 * The mentionable select component type is associated with a {@link MentionableSelectMenuBuilder}.
	 */
	[ComponentType.MentionableSelect]: MentionableSelectMenuBuilder;
	/**
	 * The channel select component type is associated with a {@link ChannelSelectMenuBuilder}.
	 */
	[ComponentType.ChannelSelect]: ChannelSelectMenuBuilder;
	/**
	 * The thumbnail component type is associated with a {@link ThumbnailBuilder}.
	 */
	[ComponentType.Thumbnail]: ThumbnailBuilder;
	/**
	 * The file component type is associated with a {@link FileBuilder}.
	 */
	[ComponentType.File]: FileBuilder;
	/**
	 * The separator component type is associated with a {@link SeparatorBuilder}.
	 */
	[ComponentType.Separator]: SeparatorBuilder;
	/**
	 * The text display component type is associated with a {@link TextDisplayBuilder}.
	 */
	[ComponentType.TextDisplay]: TextDisplayBuilder;
	/**
	 * The media gallery component type is associated with a {@link MediaGalleryBuilder}.
	 */
	[ComponentType.MediaGallery]: MediaGalleryBuilder;
	/**
	 * The section component type is associated with a {@link SectionBuilder}.
	 */
	[ComponentType.Section]: SectionBuilder;
	/**
	 * The container component type is associated with a {@link ContainerBuilder}.
	 */
	[ComponentType.Container]: ContainerBuilder;
	/**
	 * The label component type is associated with a {@link LabelBuilder}.
	 */
	[ComponentType.Label]: LabelBuilder;
	/**
	 * The file upload component type is associated with a {@link FileUploadBuilder}.
	 */
	[ComponentType.FileUpload]: FileUploadBuilder;
}

/**
 * Factory for creating components from API data.
 *
 * @typeParam ComponentType - The type of component to use
 * @param data - The API data to transform to a component class
 */
export function createComponentBuilder<ComponentType extends keyof MappedComponentTypes>(
	 
	data: (APIModalComponent | APIMessageComponent) & { type: ComponentType },
): MappedComponentTypes[ComponentType];

/**
 * Factory for creating components from API data.
 *
 * @typeParam Builder - The type of component to use
 * @param data - The API data to transform to a component class
 */
export function createComponentBuilder<Builder extends MessageComponentBuilder | ModalComponentBuilder>(
	data: Builder,
): Builder;

export function createComponentBuilder(
	data: APIMessageComponent | APIModalComponent | MessageComponentBuilder,
): ComponentBuilder<APIBaseComponent<ComponentType>> {
	if (data instanceof ComponentBuilder || (typeof data === 'object' && data !== null && 'toJSON' in data)) {
		return data as any;
	}

	const rawData = data as APIMessageComponent | APIModalComponent;
	switch (rawData.type) {
		case ComponentType.ActionRow:
			return new ActionRowBuilder(rawData as any);
		case ComponentType.Button:
			return createButtonBuilder(rawData as any) as any;
		case ComponentType.StringSelect:
			return new StringSelectMenuBuilder(rawData as any);
		case ComponentType.TextInput:
			return new TextInputBuilder(rawData as any);
		case ComponentType.UserSelect:
			return new UserSelectMenuBuilder(rawData as any);
		case ComponentType.RoleSelect:
			return new RoleSelectMenuBuilder(rawData as any);
		case ComponentType.MentionableSelect:
			return new MentionableSelectMenuBuilder(rawData as any);
		case ComponentType.ChannelSelect:
			return new ChannelSelectMenuBuilder(rawData as any);
		case ComponentType.Thumbnail:
			return new ThumbnailBuilder(rawData as any);
		case ComponentType.File:
			return new FileBuilder(rawData as any);
		case ComponentType.Separator:
			return new SeparatorBuilder(rawData as any);
		case ComponentType.TextDisplay:
			return new TextDisplayBuilder(rawData as any);
		case ComponentType.MediaGallery:
			return new MediaGalleryBuilder(rawData as any);
		case ComponentType.Section:
			return new SectionBuilder(rawData as any);
		case ComponentType.Container:
			return new ContainerBuilder(rawData as any);
		case ComponentType.Label:
			return new LabelBuilder(rawData as any);
		case ComponentType.FileUpload:
			return new FileUploadBuilder(rawData as any);
		default:
			// This case can still occur if we get a newer unsupported component type
			throw new Error(`Cannot properly serialize component type: ${rawData.type}`);
	}
}

function createButtonBuilder(data: APIButtonComponent): ButtonBuilder {
	switch (data.style) {
		case ButtonStyle.Primary:
			return new PrimaryButtonBuilder(data) as any;
		case ButtonStyle.Secondary:
			return new SecondaryButtonBuilder(data) as any;
		case ButtonStyle.Success:
			return new SuccessButtonBuilder(data) as any;
		case ButtonStyle.Danger:
			return new DangerButtonBuilder(data) as any;
		case ButtonStyle.Link:
			return new LinkButtonBuilder(data) as any;
		case ButtonStyle.Premium:
			return new PremiumButtonBuilder(data) as any;
		default:
			// @ts-expect-error This case can still occur if we get a newer unsupported button style
			throw new Error(`Cannot properly serialize button with style: ${data.style}`);
	}
}

export function resolveAccessoryComponent(component: APISectionAccessoryComponent) {
	switch (component.type) {
		case ComponentType.Button:
			return createButtonBuilder(component);
		case ComponentType.Thumbnail:
			return new ThumbnailBuilder(component);
		default:
			// @ts-expect-error This case can still occur if we get a newer unsupported component type
			throw new Error(`Cannot properly serialize section accessory component: ${component.type}`);
	}
}
