import { Poll } from '../../structures/Poll.js';
import { PollAnswer } from '../../structures/PollAnswer.js';
import { Partials } from '../../util/Partials.js';

/*

ABOUT ACTIONS

Actions are similar to WebSocket Packet Handlers, but since introducing
the REST API methods, in order to prevent rewriting code to handle data,
"actions" have been introduced. They're basically what Packet Handlers
used to be but they're strictly for manipulating data and making sure
that WebSocket events don't clash with REST methods.

*/

import type { Client } from '../Client.js';

type AnyType = ReturnType<typeof JSON.parse>;

export interface ManagerLike {
	_add: (data: AnyType, cache?: boolean) => AnyType;
	cache: { get: (id: string) => AnyType };
}

export class Action {
	public client: Client;
	constructor(client: Client) {
		this.client = client;
	}

	handle(...data: AnyType[]) {
		return data[0];
	}

	getPayload(data: AnyType, manager: ManagerLike, id: string | undefined, partialType: unknown, cache?: boolean) {
		return this.client.options.partials.includes(partialType as AnyType)
			? manager._add(data, cache)
			: manager.cache.get(id as string);
	}

	getChannel(data: AnyType) {
		const payloadData: Record<string, AnyType> = {};
		const id = (data.channel_id ?? data.id) as string | undefined;

		if (!('recipients' in data)) {
			// Try to resolve the recipient, but do not add the client user.
			const recipient = (data.author ?? data.user ?? { id: data.user_id }) as { id?: string };
			if (recipient.id !== this.client.user?.id) payloadData.recipients = [recipient];
		}

		if (id !== undefined) payloadData.id = id;

		return (
			data[this.client.actions.injectedChannel as AnyType] ??
			this.getPayload(
				{ ...data, ...payloadData },
				this.client.channels as unknown as ManagerLike,
				id,
				Partials.Channel,
				undefined,
			)
		);
	}

	getMessage(data: AnyType, channel: AnyType, cache?: boolean) {
		const id = (data.message_id ?? data.id) as string | undefined;
		return (
			data[this.client.actions.injectedMessage as AnyType] ??
			this.getPayload(
				{
					id,
					channel_id: channel.id,
					guild_id: data.guild_id ?? channel.guild?.id,
				},
				channel.messages as unknown as ManagerLike,
				id,
				Partials.Message,
				cache,
			)
		);
	}

	getPoll(data: AnyType, message: AnyType, channel: AnyType) {
		const includePollPartial = this.client.options.partials.includes(Partials.Poll);
		const includePollAnswerPartial = this.client.options.partials.includes(Partials.PollAnswer);
		if (message.partial && (!includePollPartial || !includePollAnswerPartial)) return null;

		if (!message.poll && includePollPartial) {
			message.poll = new Poll(this.client, data, message, channel);
		}

		if (message.poll && !message.poll.answers.has(data.answer_id) && includePollAnswerPartial) {
			const pollAnswer = new PollAnswer(this.client, data, message.poll);
			message.poll.answers.set(data.answer_id, pollAnswer);
		}

		return message.poll;
	}

	getReaction(data: AnyType, message: AnyType, user?: AnyType) {
		const id = (data.emoji.id ?? decodeURIComponent(data.emoji.name as string)) as string;
		return this.getPayload(
			{
				emoji: data.emoji,
				count: message.partial ? null : 0,
				me: user?.id === this.client.user?.id,
			},
			message.reactions as unknown as ManagerLike,
			id,
			Partials.Reaction,
			undefined,
		);
	}

	getMember(data: AnyType, guild: AnyType) {
		return this.getPayload(
			data,
			guild.members as unknown as ManagerLike,
			data.user.id as string,
			Partials.GuildMember,
			undefined,
		);
	}

	getUser(data: AnyType) {
		const id = data.user_id as string;
		return (
			data[this.client.actions.injectedUser as AnyType] ??
			this.getPayload({ id }, this.client.users as unknown as ManagerLike, id, Partials.User, undefined)
		);
	}

	getUserFromMember(data: AnyType) {
		if (data.guild_id && data.member?.user) {
			const guild = this.client.guilds.cache.get(data.guild_id as string);
			if (guild) {
				return guild.members._add(data.member).user;
			} else {
				return this.client.users._add(data.member.user);
			}
		}

		return this.getUser(data);
	}

	getScheduledEvent(data: AnyType, guild: AnyType) {
		const id = (data.guild_scheduled_event_id ?? data.id) as string;
		return this.getPayload(
			{ id, guild_id: data.guild_id ?? guild.id },
			guild.scheduledEvents as unknown as ManagerLike,
			id,
			Partials.GuildScheduledEvent,
			undefined,
		);
	}

	getThreadMember(id: string, manager: AnyType) {
		return this.getPayload({ user_id: id }, manager as unknown as ManagerLike, id, Partials.ThreadMember, false);
	}

	getSoundboardSound(data: AnyType, guild: AnyType) {
		return this.getPayload(
			data,
			guild.soundboardSounds as unknown as ManagerLike,
			data.sound_id as string,
			Partials.SoundboardSound,
			undefined,
		);
	}

	spreadInjectedData(data: AnyType) {
		return Object.fromEntries(
			Object.getOwnPropertySymbols(data).map((symbol) => [symbol, data[symbol as unknown as string]]),
		);
	}
}
