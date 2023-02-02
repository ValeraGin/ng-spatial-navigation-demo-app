import { NavFocusableDirective } from '../directives/nav-focusable.directive';
import { NavGridDirective } from '../directives/nav-grid.directive';
import { NavListDirective } from '../directives/nav-list.directive';
import { NavRootDirective } from '../directives/nav-root.directive';
import { NavLayerDirective } from '../directives/nav-layer.directive';

export type NavItem =
  | NavFocusableDirective
  | NavGridDirective
  | NavListDirective
  | NavRootDirective
  | NavLayerDirective;

/**
 * Элементы, которые могут быть в фокусе
 */
export type FocusableNavItem = NavFocusableDirective;

/**
 * Слои
 */
export type LayerNavItem = NavLayerDirective | NavRootDirective;

/**
 * Корневые элементы
 */
export type RootNavItem = NavRootDirective;
