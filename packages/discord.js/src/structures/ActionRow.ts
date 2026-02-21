import { createComponent  } from '../util/Components.js';
import { Component  } from './Component.js';

/**
 * Represents an action row
 *
 * @extends {Component}
 */
export class ActionRow extends Component {
  public components: any;
  constructor({ components, ...data }: any) {
    super(data);

    /**
     * The components in this action row
     *
     * @type {Component[]}
     * @readonly
     */
    // @ts-ignore
    this.components = components.map(component => createComponent(component));
  }

  /**
   * Returns the API-compatible JSON for this component
   *
   * @returns {APIActionRowComponent}
   */
  toJSON() {
    // @ts-ignore
    return { ...this.data, components: this.components.map(component => component.toJSON()) };
  }
}
