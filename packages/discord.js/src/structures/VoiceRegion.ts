import { flatten  } from '../util/Util.js';

/**
 * Represents a Discord voice region for guilds.
 */
export class VoiceRegion {
  public id: any;
  public name: any;
  public deprecated: any;
  public optimal: any;
  public custom: any;
  constructor(data: any) {
    /**
     * The region's id
     *
     * @type {string}
     */
    this.id = data.id;

    /**
     * Name of the region
     *
     * @type {string}
     */
    this.name = data.name;

    /**
     * Whether the region is deprecated
     *
     * @type {boolean}
     */
    this.deprecated = data.deprecated;

    /**
     * Whether the region is optimal
     *
     * @type {boolean}
     */
    this.optimal = data.optimal;

    /**
     * Whether the region is custom
     *
     * @type {boolean}
     */
    this.custom = data.custom;
  }

  toJSON() {
    return flatten(this);
  }
}
