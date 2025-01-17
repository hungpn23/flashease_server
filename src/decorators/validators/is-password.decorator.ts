import { registerDecorator, type ValidationOptions } from 'class-validator';

export function IsPassword(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    registerDecorator({
      propertyName: propertyKey as string,
      name: 'isPassword',
      target: target.constructor,
      constraints: [],
      options,
      validator: {
        validate(value: string) {
          return /^[\d!#$%&*@A-Z^a-z]*$/.test(value);
        },
        defaultMessage() {
          return `$property is invalid`;
        },
      },
    });
  };
}
