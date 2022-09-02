import { FocusableNavItem, NavItem } from '../types/nav-item.type';
import { NavFocusableDirective } from '../directives/nav-focusable.directive';

export function isFocusable(navItem: NavItem): navItem is FocusableNavItem {
  return navItem instanceof NavFocusableDirective
}
