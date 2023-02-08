import { NavItem } from './nav-item.type';
import { Direction } from './direction.type';

export type DirectionFnResult = NavItem | string | BlockNavigation | undefined;

/**
 * Функция, которая возвращает NavItem или идентификатор элемента навигации
 */
export type DirectionFn =
  | ((currentItem?: NavItem) => DirectionFnResult)
  | ((currentItem?: NavItem) => Promise<DirectionFnResult>);

/**
 * Объект, который блокирует навигацию в данном направлении (причина указывается в свойстве reason)
 */
export type BlockNavigation = { type: 'block'; reason: string };

/**
 * Идентификатор элемента навигации
 */
export type NavItemId = string;

/**
 * Различные допустимые типы для направления
 *
 * @example
 *  - NavItem - элемент навигации
 *  - HTMLElement - элемент DOM
 *  - NavItemId - идентификатор элемента навигации
 *  - DirectionFn - функция, которая возвращает NavItem или идентификатор элемента навигации
 *  - BlockNavigation - объект, который блокирует навигацию в данном направлении (причина указывается в свойстве reason)
 *  - undefined - навигация в данном направлении не определена (направление не блокируется)
 */
export type DirectionType =
  | NavItem
  | HTMLElement
  | NavItemId
  | DirectionFn
  | BlockNavigation
  | undefined;

/**
 * Объект, который содержит все возможные направления
 *
 * Нужен для проверки, что определенный элемент является объектом с направлениями
 */
export type Directions = {
  [key in Direction]: DirectionType;
};
