import { Routes, type Snowflake } from 'discord-api-types/v10';
import { DiscordjsTypeError, ErrorCodes } from '../errors/index.js';
import { SoundboardSound } from '../structures/SoundboardSound.js';
import { resolveBase64, resolveFile } from '../util/DataResolver.js';
import { CachedManager } from './CachedManager.js';

/**
 * Detects the MIME type of a buffer by checking its magic bytes.
 *
 * @param {Buffer} data The data to check
 * @returns {string[]}
 */
export function detectAudioMime(data: Buffer): string[] {
  if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) return ['audio/mpeg']; // ID3
  if (data[0] === 0xff && (data[1] & 0xe0) === 0xe0) return ['audio/mpeg']; // MP3 Frame
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46) return ['audio/wav']; // RIFF/WAV
  if (data[0] === 0x4f && data[1] === 0x67 && data[2] === 0x67 && data[3] === 0x53) return ['audio/ogg']; // OggS
  if (data[0] === 0x66 && data[1] === 0x4c && data[2] === 0x61 && data[3] === 0x43) return ['audio/flac']; // fLaC
  return ['application/octet-stream'];
}

/**
 * Manages API methods for Soundboard Sounds and stores their cache.
 *
 * @extends {CachedManager}
 */
export class GuildSoundboardSoundManager extends CachedManager {
  public guild: any;

  constructor(guild: any, iterable: any) {
    super(guild.client, SoundboardSound, iterable);

    /**
     * The guild this manager belongs to
     *
     * @type {Guild}
     */
    this.guild = guild;
  }

  override _add(data: any, cache: boolean) {
    return super._add(data, cache, { extras: [this.guild], id: data.sound_id });
  }

  /**
   * Resolves a {@link SoundboardSoundResolvable} to a {@link SoundboardSound} id.
   *
   * @param {any} soundboardSound The soundboard sound resolvable to resolve
   * @returns {?Snowflake}
   */
  resolveId(soundboardSound: any): Snowflake | null {
    if (soundboardSound instanceof (this as any).holds) return (soundboardSound as any).soundId;
    if (typeof soundboardSound === 'string') return soundboardSound;
    return null;
  }

  /**
   * Creates a new guild soundboard sound.
   *
   * @param {any} options Options for creating a guild soundboard sound
   * @returns {Promise<SoundboardSound>} The created soundboard sound
   */
  async create({ contentType: any, emojiId: any, emojiName: any, file: any, name: any, reason: any, volume: any }): Promise<any> {
    const resolvedFile = await resolveFile(file);

    const resolvedContentType = contentType ?? resolvedFile.contentType ?? detectAudioMime(resolvedFile.data as any)[0];

    const sound = resolveBase64(resolvedFile.data, resolvedContentType);

    const body = { emoji_id: emojiId, emoji_name: emojiName, name, sound, volume };

    const soundboardSound = await (this as any).client.rest.post(Routes.guildSoundboardSounds(this.guild.id), {
      body,
      reason,
    });

    return this._add(soundboardSound, true);
  }

  /**
   * Edits a soundboard sound.
   *
   * @param {any} soundboardSound The soundboard sound to edit
   * @param {any} [options={}] The new data for the soundboard sound
   * @returns {Promise<SoundboardSound>}
   */
  async edit(soundboardSound: any, options = {}): Promise<any> {
    const soundId = this.resolveId(soundboardSound);

    if (!soundId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'soundboardSound', 'SoundboardSoundResolvable');

    const { emojiId, emojiName, name, reason, volume } = options;

    const body = { emoji_id: emojiId, emoji_name: emojiName, name, volume };

    const data = await (this as any).client.rest.patch(Routes.guildSoundboardSound(this.guild.id, soundId), {
      body,
      reason,
    });

    const existing = (this as any).cache.get(soundId);

    if (existing) {
      const clone = existing._clone();

      clone._patch(data);
      return clone;
    }

    return this._add(data, true);
  }

  /**
   * Deletes a soundboard sound.
   *
   * @param {any} soundboardSound The soundboard sound to delete
   * @param {string} [reason] Reason for deleting this soundboard sound
   * @returns {Promise<void>}
   */
  async delete(soundboardSound: any, reason: string): Promise<void> {
    const soundId = this.resolveId(soundboardSound);

    if (!soundId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'soundboardSound', 'SoundboardSoundResolvable');

    await (this as any).client.rest.delete(Routes.guildSoundboardSound(this.guild.id, soundId), { reason });
  }

  /**
   * Obtains one or more soundboard sounds from Discord, or the soundboard sound cache if they're already available.
   *
   * @param {any} [options] Options for fetching soundboard sound(s)
   * @returns {Promise<any>}
   */
  async fetch(options: any): Promise<any> {
    if (!options) return this._fetchMany();
    const { cache, force, soundboardSound } = options;
    const resolvedSoundboardSound = this.resolveId(soundboardSound ?? options);
    if (resolvedSoundboardSound) return this._fetchSingle({ cache, force, soundboardSound: resolvedSoundboardSound });
    return this._fetchMany({ cache });
  }

  async _fetchSingle({ cache, force, soundboardSound }: any = {}): Promise<any> {
    if (!force) {
      const existing = (this as any).cache.get(soundboardSound);
      if (existing) return existing;
    }

    const data = await (this as any).client.rest.get(Routes.guildSoundboardSound(this.guild.id, soundboardSound));
    return this._add(data, cache);
  }

  async _fetchMany({ cache }: any = {}): Promise<any> {
    const data = await (this as any).client.rest.get(Routes.guildSoundboardSounds(this.guild.id));

    return (data as any).items.reduce((coll: any, sound: any) => coll.set(sound.sound_id, this._add(sound, cache)), new (this as any).client.options.makeCache());
  }
}
