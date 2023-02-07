import { Injectable } from '@angular/core';
import { NavItem } from './types/nav-item.type';
import { deleteByValue } from "./utils/delete-by-value";
import { debugLog } from "./utils/debug";

@Injectable()
export class NavigationItemsStoreService {

  constructor() {
    debugLog('create NavigationItemsStoreService');
  }

  private navItems: Record<string, NavItem> = {};

  getNavItemByElement(element: HTMLElement): NavItem | undefined {
    const navItem = Object.values(this.navItems).find(
      (navItem) => navItem.el.nativeElement === element
    );
    if (navItem) {
      return navItem;
    } else {
      console.error('NavItem not found by element', element);
      return undefined;
    }
  }

  getNavItemById(id: string): NavItem | undefined {
    const navItem = this.navItems[id];
    if (navItem) {
      return navItem;
    } else {
      console.error('NavItem not found by id', id);
      return undefined;
    }
  }

  addNavItem(navItem: NavItem): void {
    const id = navItem.navId;
    if (id && !this.navItems[id]) {
      this.navItems[id] = navItem;
    }
  }

  removeNavItem(navItem: NavItem): void {
    const id = navItem.navId;
    if (id) {
      delete this.navItems[id];
    }
  }

  changedNavItemId(navItem: NavItem): void {
    deleteByValue(this.navItems, navItem);
    this.addNavItem(navItem)
  }
}
