import { Injectable } from '@angular/core';
import { NavItem } from './types/nav-item.type';

@Injectable()
export class NavigationItemsStoreService {

  navItems: Record<string, NavItem> = {};

  getNavItemByElement(element: HTMLElement): NavItem | undefined {
    return Object.values(this.navItems).find(navItem => navItem.el.nativeElement === element);
  }

  getNavItemById(id: string): NavItem | undefined {
    return this.navItems[id];
  }

  addNavItem(navItem: NavItem) {
    if (navItem.id) {
      this.navItems[navItem.id] = navItem;
    }
  }

  removeNavItem(navItem: NavItem) {
    if (navItem.id) {
      delete this.navItems[navItem.id];
    }
  }

  changeNavItemId(navItem: NavItem, prevId?: string) {
    if (prevId) {
      delete this.navItems[prevId];
    }
    if (navItem.id) {
      this.navItems[navItem.id] = navItem;
    }
  }

}
