export type EventPromise = () => Promise<void> | void;

export class EventV1 {
  protected _isSet = false;
  protected _promises: EventPromise[] = [];

  public async setAsync(): Promise<void> {
    if (!this._isSet) {
      this._isSet = true;
      await this.trigger();
    }
  }

  public set(): void {
    if (!this._isSet) {
      this._isSet = true;
      void this.trigger();
    }
  }

  public isSet(): boolean {
    return this._isSet;
  }

  public async wait(): Promise<void> {
    await new Promise<void>((done) => this._promises.push(done));
  }

  protected async trigger(): Promise<void> {
    for (const promise of this._promises) {
      await promise.call(null);
    }
  }
}

export class EventV2 extends EventV1 {
  public clear(): void {
    this._isSet = false;
    this._promises = [];
  }
}
