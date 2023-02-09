import { Injectable } from '@angular/core';
import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';

/**
 * Кастомный RouteReuseStrategy.
 * Позволяет сохранять состояние компонентов при переходе по роутам (например, чтобы не перезагружать видео при переходе на страницу с видео)
 *
 * @example
 * // Добавить в роутинг компонента data: { reuse: true }
 * // Добавить в app.module.ts в providers: [{ provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }]
 *
 * @see https://medium.com/javascript-in-plain-english/angular-route-reuse-strategy-b5d40adce841
 * @see https://stackoverflow.com/questions/49155895/how-to-activate-routereusestrategy-only-for-specific-routes
 */
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle | null } = {};

  constructor() {}

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['reuse'] || false;
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    if (route.data['reuse'] && route?.routeConfig?.path) {
      this.handlers[route.routeConfig.path] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      !!route?.routeConfig?.path && !!this.handlers[route?.routeConfig?.path]
    );
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) return null;
    return !!route?.routeConfig?.path && this.handlers[route.routeConfig.path];
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.data['reuse'] || false;
  }
}
