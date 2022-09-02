import { NavFocusableDirective } from '../directives/nav-focusable.directive';
import { NavGridDirective } from '../directives/nav-grid.directive';
import { NavListDirective } from '../directives/nav-list.directive';
import { NavRootDirective } from '../directives/nav-root.directive';

export type NavItem = NavFocusableDirective | NavGridDirective | NavListDirective | NavRootDirective;

export type FocusableNavItem = NavFocusableDirective;

export type RootNavItem = NavRootDirective;
