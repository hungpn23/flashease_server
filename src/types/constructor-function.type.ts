export type FunctionConstructor<T = any> = new (...args: any[]) => T;

/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T;
