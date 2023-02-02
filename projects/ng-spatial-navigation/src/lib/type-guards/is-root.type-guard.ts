import { NavItem, RootNavItem } from '../types/nav-item.type';
import { NavRootDirective } from '../directives/nav-root.directive';

/**
 * Проверяет, является ли элемент корневым
 *
 * @param navItem - элемент для проверки
 */
export function isRoot(navItem: NavItem): navItem is RootNavItem {
  return navItem instanceof NavRootDirective;
}
