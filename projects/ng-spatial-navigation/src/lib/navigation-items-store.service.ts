import { Injectable } from '@angular/core';
import { NavItem } from './types/nav-item.type';
import { deleteByValue } from "./utils/delete-by-value";

@Injectable()
export class NavigationItemsStoreService {
  private navItems: Record<string, NavItem> = {};

  getNavItemByElement(element: HTMLElement): NavItem | undefined {
    return Object.values(this.navItems).find(
      (navItem) => navItem.el.nativeElement === element
    );
  }

  getNavItemById(id: string): NavItem | undefined {
    return this.navItems[id];
  }

  addNavItem(navItem: NavItem): void {
    const id = navItem.navId || navItem.el.nativeElement.id;
    if (id && !this.navItems[id]) {
      this.navItems[id] = navItem;
    }
  }

  removeNavItem(navItem: NavItem): void {
    const id = navItem.navId || navItem.el.nativeElement.id;
    if (id) {
      delete this.navItems[id];
    }
  }

  changedNavItemId(navItem: NavItem): void {
    deleteByValue(this.navItems, navItem);
    this.addNavItem(navItem)
  }
}
