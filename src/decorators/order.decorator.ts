// issue: https://github.com/typeorm/typeorm/issues/541#issuecomment-2014291439

const ORDER_KEY = Symbol.for('order_key');
export function Order(value: number): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(ORDER_KEY, value, target, propertyKey);
  };
}

export function getOrder(
  target: unknown,
  propertyKey: string | symbol,
  defaultValue = 0,
) {
  const result = Reflect.getMetadata(ORDER_KEY, target, propertyKey);
  if (typeof result === 'number') return result;

  return defaultValue;
}
