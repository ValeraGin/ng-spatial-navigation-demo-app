/**
 * Декоратор для дебаунса функции внутри класса (например, для обработки частых событий)
 *
 * @param timeout - время дебаунса в миллисекундах
 *
 * @example
 * export class TestClass {
 *  @Debounce(1000)
 *  public onResize(): void {
 *    console.log('resize');
 *  }
 *  constructor() {
 *    window.addEventListener('resize', this.onResize);
 *  }
 * }
 */
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
