/**
 * Represents a component
 */
export class Component {
  public data: any;
  constructor(data) {
    /**
     * The API data associated with this component
     *
     * @type {APIMessageComponent}
     */
    this.data = data;
  }

  /**
   * The id of this component
   *
   * @type {number}
   * @readonly
   */
  get id() {
    return this.data.id;
  }

  /**
   * The type of the component
   *
   * @type {ComponentType}
   * @readonly
   */
  get type() {
    return this.data.type;
  }

  /**
   * Whether or not the given components are equal
   *
   * @param {Component|APIMessageComponent} other The component to compare against
   * @returns {boolean}
   */
  equals(other) {
    if (other instanceof Component) {
      return Bun.deepEquals(other.data, this.data);
    }

    return Bun.deepEquals(other, this.data);
  }

  /**
   * Returns the API-compatible JSON for this component
   *
   * @returns {APIMessageComponent}
   */
  toJSON() {
    return { ...this.data };
  }
}
