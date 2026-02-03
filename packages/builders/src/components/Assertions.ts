import { ButtonStyle, ChannelType, ComponentType, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { z } from 'zod';
import { idPredicate, customIdPredicate, snowflakePredicate } from '../Assertions.js';

export const emojiPredicate = z
	.strictObject({
		id: snowflakePredicate.optional(),
		name: z.string().min(1).max(32).optional(),
		animated: z.boolean().optional(),
	})
	.refine((data) => data.id !== undefined || data.name !== undefined, {
		message: "Either 'id' or 'name' must be provided",
	});

const buttonPredicateBase = z.strictObject({
	type: z.literal(ComponentType.Button),
	disabled: z.boolean().optional(),
});

const buttonLabelPredicate = z.string().min(1).max(80);

const buttonCustomIdPredicateBase = buttonPredicateBase
	.extend({
		custom_id: customIdPredicate,
		emoji: emojiPredicate.optional(),
		label: buttonLabelPredicate.optional(),
	});



const buttonPrimaryPredicate = buttonCustomIdPredicateBase.extend({ style: z.literal(ButtonStyle.Primary) });
const buttonSecondaryPredicate = buttonCustomIdPredicateBase.extend({ style: z.literal(ButtonStyle.Secondary) });
const buttonSuccessPredicate = buttonCustomIdPredicateBase.extend({ style: z.literal(ButtonStyle.Success) });
const buttonDangerPredicate = buttonCustomIdPredicateBase.extend({ style: z.literal(ButtonStyle.Danger) });

const buttonPrimaryRefinedPredicate = buttonPrimaryPredicate.refine((data) => data.emoji !== undefined || data.label !== undefined, {
	message: 'Buttons with a custom id must have either an emoji or a label.',
});
const buttonSecondaryRefinedPredicate = buttonSecondaryPredicate.refine((data) => data.emoji !== undefined || data.label !== undefined, {
	message: 'Buttons with a custom id must have either an emoji or a label.',
});
const buttonSuccessRefinedPredicate = buttonSuccessPredicate.refine((data) => data.emoji !== undefined || data.label !== undefined, {
	message: 'Buttons with a custom id must have either an emoji or a label.',
});
const buttonDangerRefinedPredicate = buttonDangerPredicate.refine((data) => data.emoji !== undefined || data.label !== undefined, {
	message: 'Buttons with a custom id must have either an emoji or a label.',
});

const buttonLinkPredicate = buttonPredicateBase
	.extend({
		style: z.literal(ButtonStyle.Link),
		url: z.string().url().max(512).refine((url) => url.startsWith('http:') || url.startsWith('https:') || url.startsWith('discord:'), { message: 'URL must use http, https, or discord protocol' }),
		emoji: emojiPredicate.optional(),
		label: buttonLabelPredicate.optional(),
	})
	.refine((data) => data.emoji !== undefined || data.label !== undefined, {
		message: 'Link buttons must have either an emoji or a label.',
	});

const buttonPremiumPredicate = buttonPredicateBase.extend({
	style: z.literal(ButtonStyle.Premium),
	sku_id: snowflakePredicate,
});

export const buttonPredicate = z.union([
	buttonLinkPredicate,
	buttonPrimaryRefinedPredicate,
	buttonSecondaryRefinedPredicate,
	buttonSuccessRefinedPredicate,
	buttonDangerRefinedPredicate,
	buttonPremiumPredicate,
]);

const selectMenuBasePredicate = z.object({
	id: idPredicate,
	placeholder: z.string().max(150).optional(),
	min_values: z.number().min(0).max(25).optional(),
	max_values: z.number().min(0).max(25).optional(),
	custom_id: customIdPredicate,
	disabled: z.boolean().optional(),
});

export const selectMenuChannelPredicate = selectMenuBasePredicate.extend({
	type: z.literal(ComponentType.ChannelSelect),
	channel_types: z.nativeEnum(ChannelType).array().optional(),
	default_values: z
		.object({ id: snowflakePredicate, type: z.literal(SelectMenuDefaultValueType.Channel) })
		.array()
		.max(25)
		.optional(),
});

export const selectMenuMentionablePredicate = selectMenuBasePredicate.extend({
	type: z.literal(ComponentType.MentionableSelect),
	default_values: z
		.object({
			id: snowflakePredicate,
			type: z.union([z.literal(SelectMenuDefaultValueType.Role), z.literal(SelectMenuDefaultValueType.User)]),
		})
		.array()
		.max(25)
		.optional(),
});

export const selectMenuRolePredicate = selectMenuBasePredicate.extend({
	type: z.literal(ComponentType.RoleSelect),
	default_values: z
		.object({ id: snowflakePredicate, type: z.literal(SelectMenuDefaultValueType.Role) })
		.array()
		.max(25)
		.optional(),
});

export const selectMenuStringOptionPredicate = z.object({
	label: z.string().min(1).max(100),
	value: z.string().min(1).max(100),
	description: z.string().min(1).max(100).optional(),
	emoji: emojiPredicate.optional(),
	default: z.boolean().optional(),
});

export const selectMenuStringPredicate = selectMenuBasePredicate
	.extend({
		type: z.literal(ComponentType.StringSelect),
		options: selectMenuStringOptionPredicate.array().min(1).max(25),
	})
	.superRefine((value, ctx) => {
		const addIssue = (name: string, minimum: number) =>
			ctx.addIssue({
				code: z.ZodIssueCode.too_small,
				message: `The number of options must be greater than or equal to ${name}`,
				inclusive: true,
				minimum,
				type: 'array',
				path: ['options'],
			});

		if (value.min_values !== undefined && value.options.length < value.min_values) {
			addIssue('min_values', value.min_values);
		}

		if (
			value.min_values !== undefined &&
			value.max_values !== undefined &&
			value.min_values > value.max_values
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.too_big,
				message: `The maximum amount of options must be greater than or equal to the minimum amount of options`,
				inclusive: true,
				maximum: value.max_values,
				type: 'number',
				path: ['min_values'],
			});
		}
	});

export const selectMenuUserPredicate = selectMenuBasePredicate.extend({
	type: z.literal(ComponentType.UserSelect),
	default_values: z
		.object({ id: snowflakePredicate, type: z.literal(SelectMenuDefaultValueType.User) })
		.array()
		.max(25)
		.optional(),
});

export const actionRowPredicate = z.object({
	id: idPredicate,
	type: z.literal(ComponentType.ActionRow),
	components: z.union([
		z
			.object({ type: z.literal(ComponentType.Button) })
			.array()
			.min(1)
			.max(5),
		z
			.object({
				type: z.union([
					z.literal(ComponentType.ChannelSelect),
					z.literal(ComponentType.MentionableSelect),
					z.literal(ComponentType.StringSelect),
					z.literal(ComponentType.RoleSelect),
					z.literal(ComponentType.TextInput),
					z.literal(ComponentType.UserSelect),
				]),
			})
			.array()
			.length(1),
	]),
});
