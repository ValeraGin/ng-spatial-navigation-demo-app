export function Debounce(timeout: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor => {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]): void {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        original.apply(this, args);
      }, timeout);
    };
    return descriptor;
  };
}
