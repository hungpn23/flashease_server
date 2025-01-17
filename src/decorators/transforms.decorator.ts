import { Transform } from 'class-transformer';

export function ToLowerCase(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) return;

    if (Array.isArray(value)) {
      return value.map((v) => v.toLowerCase());
    }

    return value.toLowerCase();
  });
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) return;

    if (Array.isArray(value)) {
      return value.map((v) => v.toUpperCase());
    }

    return value.toUpperCase();
  });
}

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    switch (value) {
      case 'true':
        return true;

      case 'false':
        return false;

      default:
        return value;
    }
  });
}
