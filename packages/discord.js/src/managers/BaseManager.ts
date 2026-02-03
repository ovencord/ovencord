
/**
 * Manages the API methods of a data model.
 *
 * @abstract
 */
export abstract class BaseManager {
  public client: any;

  constructor(client: any) {
    this.client = client;
  }
}
