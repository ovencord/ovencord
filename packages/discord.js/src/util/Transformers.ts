import { isJSONEncodable } from '@ovencord/util';
import type { APIAutoModerationAction, APIMessageInteractionMetadata } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { AuthorizingIntegrationOwners } from '../structures/AuthorizingIntegrationOwners.js';

/**
 * Transforms a string to snake_case.
 *
 * @param {string} str The string to transform
 * @returns {string}
 */
const snakeCase = (str: string): string => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * Transforms camel-cased keys into snake cased keys
 *
 * @param {unknown} obj The object to transform
 * @returns {unknown}
 */
export function toSnakeCase(obj: unknown): unknown {
	if (typeof obj !== 'object' || !obj) return obj;
	if (obj instanceof Date) return obj;
	if (isJSONEncodable(obj)) return toSnakeCase(obj.toJSON());
	if (Array.isArray(obj)) return obj.map(toSnakeCase);
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [snakeCase(key), toSnakeCase(value)]));
}

/**
 * Transforms an API auto moderation action object to a camel-cased variant.
 *
 * @param {APIAutoModerationAction} autoModerationAction The action to transform
 * @returns {unknown}
 * @ignore
 */
export function _transformAPIAutoModerationAction(autoModerationAction: APIAutoModerationAction): any {
	return {
		type: autoModerationAction.type,
		metadata: {
			durationSeconds: (autoModerationAction.metadata as any).duration_seconds ?? null,
			channelId: (autoModerationAction.metadata as any).channel_id ?? null,
			customMessage: (autoModerationAction.metadata as any).custom_message ?? null,
		},
	};
}

/**
 * Transforms an API message interaction metadata object to a camel-cased variant.
 *
 * @param {Client} client The client
 * @param {APIMessageInteractionMetadata} messageInteractionMetadata The metadata to transform
 * @returns {unknown}
 * @ignore
 */
export function _transformAPIMessageInteractionMetadata(
	client: Client,
	messageInteractionMetadata: APIMessageInteractionMetadata,
): any {
	return {
		id: messageInteractionMetadata.id,
		type: messageInteractionMetadata.type,
		user: (client.users as any)._add(messageInteractionMetadata.user),
		authorizingIntegrationOwners: new AuthorizingIntegrationOwners(
			client,
			messageInteractionMetadata.authorizing_integration_owners,
		),
		originalResponseMessageId: (messageInteractionMetadata as any).original_response_message_id ?? null,
		interactedMessageId: (messageInteractionMetadata as any).interacted_message_id ?? null,
		triggeringInteractionMetadata: (messageInteractionMetadata as any).triggering_interaction_metadata
			? _transformAPIMessageInteractionMetadata(
					client,
					(messageInteractionMetadata as any).triggering_interaction_metadata,
				)
			: null,
	};
}

/**
 * Transforms a guild scheduled event recurrence rule object to a snake-cased variant.
 *
 * @param {any} recurrenceRule The recurrence rule to transform
 * @returns {any}
 * @ignore
 */
export function _transformGuildScheduledEventRecurrenceRule(recurrenceRule: any): any {
	return {
		start: new Date(recurrenceRule.startAt).toISOString(),
		frequency: recurrenceRule.frequency,
		interval: recurrenceRule.interval,
		by_weekday: recurrenceRule.byWeekday,
		by_n_weekday: recurrenceRule.byNWeekday,
		by_month: recurrenceRule.byMonth,
		by_month_day: recurrenceRule.byMonthDay,
	};
}

/**
 * Transforms API incidents data to a camel-cased variant.
 *
 * @param {any} data The incidents data to transform
 * @returns {any}
 * @ignore
 */
export function _transformAPIIncidentsData(data: any): any {
	return {
		invitesDisabledUntil: data.invites_disabled_until ? new Date(data.invites_disabled_until) : null,
		dmsDisabledUntil: data.dms_disabled_until ? new Date(data.dms_disabled_until) : null,
		dmSpamDetectedAt: data.dm_spam_detected_at ? new Date(data.dm_spam_detected_at) : null,
		raidDetectedAt: data.raid_detected_at ? new Date(data.raid_detected_at) : null,
	};
}

/**
 * Transforms a collectibles object to a camel-cased variant.
 *
 * @param {any} collectibles The collectibles to transform
 * @returns {any}
 * @ignore
 */
export function _transformCollectibles(collectibles: any): any {
	if (!collectibles.nameplate) return { nameplate: null };

	return {
		nameplate: {
			skuId: collectibles.nameplate.sku_id,
			asset: collectibles.nameplate.asset,
			label: collectibles.nameplate.label,
			palette: collectibles.nameplate.palette,
		},
	};
}
