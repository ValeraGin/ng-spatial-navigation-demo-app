/**
 * Декоратор для приведения атрибута к булевому типу
 *
 * Дает возможность использовать атрибуты вида: isDisabled, [isDisabled]="true", [isDisabled]="false"
 *
 * @example
 * export class TestClass {
 * @CoerceBoolean()
 * public isDisabled: boolean;
 * }
 *
 * <test-class isDisabled></test-class>
 */
export function CoerceBoolean(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const coercedBooleanKey = `__${String(propertyKey)}`;
    Object.defineProperty(target, propertyKey, {
      get(): boolean {
        return this[coercedBooleanKey] || false;
      },
      set(booleanAttribute: boolean | unknown): void {
        this[coercedBooleanKey] =
          booleanAttribute === '' ||
          booleanAttribute === 'true' ||
          booleanAttribute === true;
      },
    });
  };
}
