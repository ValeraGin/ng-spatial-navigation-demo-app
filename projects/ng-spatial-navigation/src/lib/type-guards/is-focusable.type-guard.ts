import { FocusableNavItem, NavItem } from '../types/nav-item.type';
import { NavFocusableDirective } from '../directives/nav-focusable.directive';

/**
 * Проверяет, является ли элемент фокусируемым
 *
 * @param navItem - элемент для проверки
 */
export function isFocusable(navItem: NavItem): navItem is FocusableNavItem {
  return navItem instanceof NavFocusableDirective;
}
