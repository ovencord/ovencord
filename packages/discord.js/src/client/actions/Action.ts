import { Poll  } from '../../structures/Poll.js';
import { PollAnswer  } from '../../structures/PollAnswer.js';
import { Partials  } from '../../util/Partials.js';

/*

ABOUT ACTIONS

Actions are similar to WebSocket Packet Handlers, but since introducing
the REST API methods, in order to prevent rewriting code to handle data,
"actions" have been introduced. They're basically what Packet Handlers
used to be but they're strictly for manipulating data and making sure
that WebSocket events don't clash with REST methods.

*/

import type { Client } from '../Client.js';

export class Action {
  public client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  handle(...data: any[]) {
    return data[0];
  }

  getPayload(data: any, manager: any, id: any, partialType: any, cache?: any) {
    return this.client.options.partials.includes(partialType) ? manager._add(data, cache) : manager.cache.get(id);
  }

  getChannel(data: any) {
    const payloadData: Record<string, any> = {};
    const id = data.channel_id ?? data.id;

    if (!('recipients' in data)) {
      // Try to resolve the recipient, but do not add the client user.
      const recipient = data.author ?? data.user ?? { id: data.user_id };
      if (recipient.id !== this.client.user?.id) payloadData.recipients = [recipient];
    }

    if (id !== undefined) payloadData.id = id;

    return (
      data[this.client.actions.injectedChannel] ??
      this.getPayload({ ...data, ...payloadData }, this.client.channels, id, Partials.Channel, undefined)
    );
  }

  getMessage(data: any, channel: any, cache?: any) {
    const id = data.message_id ?? data.id;
    return (
      data[this.client.actions.injectedMessage] ??
      this.getPayload(
        {
          id,
          channel_id: channel.id,
          guild_id: data.guild_id ?? channel.guild?.id,
        },
        channel.messages,
        id,
        Partials.Message,
        cache,
      )
    );
  }

  getPoll(data: any, message: any, channel: any) {
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

  getReaction(data: any, message: any, user?: any) {
    const id = data.emoji.id ?? decodeURIComponent(data.emoji.name);
    return this.getPayload(
      {
        emoji: data.emoji,
        count: message.partial ? null : 0,
        me: user?.id === this.client.user?.id,
      },
      message.reactions,
      id,
      Partials.Reaction,
      undefined,
    );
  }

  getMember(data: any, guild: any) {
    return this.getPayload(data, guild.members, data.user.id, Partials.GuildMember, undefined);
  }

  getUser(data: any) {
    const id = data.user_id;
    return data[this.client.actions.injectedUser] ?? this.getPayload({ id }, this.client.users, id, Partials.User, undefined);
  }

  getUserFromMember(data: any) {
    if (data.guild_id && data.member?.user) {
      const guild = this.client.guilds.cache.get(data.guild_id);
      if (guild) {
        return guild.members._add(data.member).user;
      } else {
        return this.client.users._add(data.member.user);
      }
    }

    return this.getUser(data);
  }

  getScheduledEvent(data: any, guild: any) {
    const id = data.guild_scheduled_event_id ?? data.id;
    return this.getPayload(
      { id, guild_id: data.guild_id ?? guild.id },
      guild.scheduledEvents,
      id,
      Partials.GuildScheduledEvent,
      undefined,
    );
  }

  getThreadMember(id: any, manager: any) {
    return this.getPayload({ user_id: id }, manager, id, Partials.ThreadMember, false);
  }

  getSoundboardSound(data: any, guild: any) {
    return this.getPayload(data, guild.soundboardSounds, data.sound_id, Partials.SoundboardSound, undefined);
  }

  spreadInjectedData(data: any) {
    return Object.fromEntries(Object.getOwnPropertySymbols(data).map(symbol => [symbol, data[symbol]]));
  }
}
