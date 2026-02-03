import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { z } from 'zod';
import { localeMapPredicate, memberPermissionsPredicate } from '../../../Assertions.js';

const namePredicate = z
	.string()
	.min(1)
	.max(32)
	.refine((val) => val.trim().length > 0, {
		message: 'Must not consist of only whitespace.',
	});

const contextsPredicate = z.array(z.nativeEnum(InteractionContextType));
const integrationTypesPredicate = z.array(z.nativeEnum(ApplicationIntegrationType));

const baseContextMenuCommandPredicate = z.object({
	contexts: contextsPredicate.optional(),
	default_member_permissions: memberPermissionsPredicate.optional(),
	name: namePredicate,
	name_localizations: localeMapPredicate.optional(),
	integration_types: integrationTypesPredicate.optional(),
	nsfw: z.boolean().optional(),
});

export const userCommandPredicate = baseContextMenuCommandPredicate.extend({
	type: z.literal(ApplicationCommandType.User),
});

export const messageCommandPredicate = baseContextMenuCommandPredicate.extend({
	type: z.literal(ApplicationCommandType.Message),
});
