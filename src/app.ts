import { ShutdownSignal } from '@/constants';
import { AppTerminated } from '@/exceptions';
import { EventV1 } from '@/utils';
import { values } from 'lodash';
import { Once } from 'lodash-decorators';
import { v1 } from 'uuid';

export interface AppOptions {
  shutdownSignals?: ShutdownSignal[];
}

export class App {
  protected readonly _appId: string;
  protected readonly _options: AppOptions;
  protected readonly _isTerminated: EventV1;

  public constructor(options: AppOptions = {}) {
    this._appId = v1();
    this._options = options;
    this._isTerminated = new EventV1();

    this.initialize();

    return new Proxy(this, {
      get(target: App, propKey: string | symbol, receiver: App): unknown {
        if (target._isTerminated.isSet()) {
          throw new AppTerminated();
        }
        return Reflect.get(target, propKey, receiver);
      },
    });
  }

  @Once()
  public async terminate(): Promise<void> {
    await this._isTerminated.setAsync();
  }

  @Once()
  protected initialize(): void {
    const shutdownSignals = this._options.shutdownSignals ?? values(ShutdownSignal);
    for (const signal of shutdownSignals) {
      process.on(signal, () => void this.terminate());
    }
  }

  public getAppId(): string {
    return this._appId;
  }

  public async waitTerminal(): Promise<void> {
    return await this._isTerminated.wait();
  }
}
