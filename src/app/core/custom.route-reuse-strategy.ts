// custom route reuse strategy by routeConfig with  comments
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers: { [key: string]: DetachedRouteHandle } = {};

  // Проверяет, можно ли отсоединить маршрут
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.data && !!route.data['reuse'];
  }

  // Сохраняет маршрут
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[route.routeConfig?.path as string] = handle;
  }

  // Проверяет, можно ли присоединить маршрут
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig?.path && !!this.handlers[route.routeConfig?.path as string];
  }

  // Возвращает сохраненный маршрут
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig?.path) {
      // @ts-ignore
      return null;
    }

    return this.handlers[route.routeConfig.path];
  }

  // Проверяет, можно ли повторно использовать маршрут
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
