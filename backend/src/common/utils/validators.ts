import { Matches, ValidationOptions } from 'class-validator';
import { SLUG_PATTERN } from './slug';

export const ARMENIAN_PHONE = /^\+374\d{8}$/;

export function IsArmenianPhone(options?: ValidationOptions): PropertyDecorator {
  return Matches(ARMENIAN_PHONE, { message: 'isArmenianPhone', ...options });
}

export function IsSlug(options?: ValidationOptions): PropertyDecorator {
  return Matches(SLUG_PATTERN, { message: 'isSlug', ...options });
}
