import { ShutdownSignal } from '@/constants';
import { Service } from '@/decorators';
import { AppTerminated } from '@/exceptions';
import { EventV1 } from '@/utils';
import { Container } from 'inversify';
import { values } from 'lodash';
import { Once } from 'lodash-decorators';
import { Subject } from 'rxjs';
import type { Class } from 'utility-types';
import { v1 } from 'uuid';

export interface AppOptions {
  shutdownSignals?: ShutdownSignal[];
}

export const appSubject = new Subject<App>();

@Service()
export class App {
  protected readonly _appId: string;
  protected readonly _options: AppOptions;
  protected readonly _container: Container;
  protected readonly _isTerminated: EventV1;

  public constructor(options: AppOptions = {}) {
    this._appId = v1();
    this._options = options;
    this._container = new Container();
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
    this.getContainer().bind(App).toConstantValue(this);

    appSubject.next(this);
    appSubject.complete();
  }

  public getAppId(): string {
    return this._appId;
  }

  public getContainer(): Container {
    return this._container;
  }

  public resolve<T>(target: Class<T>): T {
    return this.getContainer().get<T>(target);
  }

  public async waitTerminal(): Promise<void> {
    return await this._isTerminated.wait();
  }
}
