import { appSubject } from '@/app';
import { injectable } from 'inversify';
import { isFunction } from 'lodash';

export const Transient = (): ClassDecorator => {
  return <T>(target: T): T => {
    injectable()(target);
    if (isFunction(target)) {
      appSubject.subscribe((app) => {
        if (!app.getContainer().isBound(target)) {
          app.getContainer().bind(target).toSelf().inTransientScope();
        }
      });
    }
    return target;
  };
};
