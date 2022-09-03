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
