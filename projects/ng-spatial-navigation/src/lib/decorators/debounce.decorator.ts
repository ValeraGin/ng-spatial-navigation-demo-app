export function Debounce(timeout: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        original.apply(this, args);
      }, timeout);
    }
    return descriptor;
  }
}
