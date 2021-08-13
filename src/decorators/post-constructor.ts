import { postConstruct } from 'inversify';
import { isString } from 'lodash';

export const PostConstructor = (): MethodDecorator => {
  return <T>(
    target: unknown,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> => {
    if (isString(propertyKey)) {
      postConstruct()(target, propertyKey, descriptor);
    }

    return descriptor;
  };
};
