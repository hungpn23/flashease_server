import { FunctionConstructor } from '@/types/constructor-function.type';
import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ToBoolean, ToLowerCase, ToUpperCase } from './transforms.decorator';
import { IsPassword } from './validators/is-password.decorator';

type CommonOptions = {
  isArray?: boolean; // to check if prop is an array & to validate each items in array
  required?: boolean;
};

type NumberOptions = CommonOptions & {
  min?: number;
  max?: number;
  isInt?: boolean;
  isPositive?: boolean;
};

type StringOptions = CommonOptions & {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
};

type UrlOptions = CommonOptions & {
  require_tld?: boolean;
};

export function NumberValidators(options?: NumberOptions): PropertyDecorator {
  let decorators = [Type(() => Number)];

  decorators = checkCommonOptions(decorators, options);

  decorators.push(
    options?.isInt
      ? IsInt({ each: options?.isArray })
      : IsNumber({}, { each: options?.isArray }),
  );

  if (options?.min) {
    decorators.push(Min(options?.min, { each: options?.isArray }));
  }

  if (options?.max) {
    decorators.push(Max(options?.max, { each: options?.isArray }));
  }

  if (options?.isPositive) {
    decorators.push(IsPositive({ each: options?.isArray }));
  }

  return applyDecorators(...decorators);
}

export function PortValidators() {
  return NumberValidators({ isInt: true, min: 1, max: 65535 });
}

export function StringValidators(options?: StringOptions): PropertyDecorator {
  let decorators = [Type(() => String), IsString({ each: options?.isArray })];

  decorators = checkCommonOptions(decorators, options);

  if (decorators.indexOf(IsOptional)) {
    decorators.push(MinLength(0, { each: options?.isArray }));
  } else {
    decorators.push(
      MinLength(options?.minLength ?? 1, { each: options?.isArray }),
    );
  }

  if (options?.maxLength)
    decorators.push(MaxLength(options?.maxLength, { each: options?.isArray }));

  if (options?.toLowerCase) decorators.push(ToLowerCase());

  if (options?.toUpperCase) decorators.push(ToUpperCase());

  return applyDecorators(...decorators);
}

export function UrlValidators(
  options?: CommonOptions & UrlOptions,
): PropertyDecorator {
  let decorators = [
    Type(() => String),
    IsString({ each: options?.isArray }),
    IsUrl({ require_tld: options?.require_tld }, { each: options?.isArray }),
  ];

  decorators = checkCommonOptions(decorators, options);

  return applyDecorators(...decorators);
}

export function PasswordValidators(options?: StringOptions): PropertyDecorator {
  let decorators = [
    StringValidators({ ...options, minLength: 8 }),
    IsPassword(),
  ];

  decorators = checkCommonOptions(decorators, options);

  return applyDecorators(...decorators);
}

export function BooleanValidators(options?: CommonOptions): PropertyDecorator {
  let decorators = [ToBoolean(), IsBoolean({ each: options?.isArray })];

  decorators = checkCommonOptions(decorators, options);

  return applyDecorators(...decorators);
}

export function EmailValidators(options?: StringOptions): PropertyDecorator {
  let decorators = [
    IsEmail(),
    StringValidators({ toLowerCase: true, ...options }),
  ];

  decorators = checkCommonOptions(decorators, options);

  return applyDecorators(...decorators);
}

export function EnumValidators(
  entity: object,
  options?: CommonOptions,
): PropertyDecorator {
  let decorators = [IsEnum(entity, { each: options?.isArray })];
  decorators = checkCommonOptions(decorators, options);

  return applyDecorators(...decorators);
}

export function ClassValidators<TClass extends FunctionConstructor>(
  className: TClass,
  options?: CommonOptions,
) {
  let decorators = [
    Type(() => className),
    ValidateNested({ each: options?.isArray }),
  ];

  decorators = checkCommonOptions(decorators, options);

  return applyDecorators(...decorators);
}

/* =================================================================== */

function checkCommonOptions(
  decorators: PropertyDecorator[],
  options?: CommonOptions,
) {
  if (options?.required === false) {
    decorators.push(IsOptional({ each: options?.isArray }));
  } else {
    decorators.push(IsDefined({ each: options?.isArray }));
  }

  return decorators;
}
