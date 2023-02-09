import { Injectable } from '@angular/core';
import { NavItem } from './types/nav-item.type';
import { debugLog } from './utils/debug';

@Injectable()
export class NavigationItemsStoreService {
  navItems: NavItem[] = [];

  constructor() {}

  getNavItemByElement(element: Element, silent = false): NavItem | undefined {
    const navItem = this.navItems.find(
      (navItem) => navItem.el.nativeElement === element
    );
    if (navItem) {
      return navItem;
    } else {
      if (!silent) {
        console.error('NavItem not found by element', element);
      }
      return undefined;
    }
  }

  getNavItemByNodeRecursive(node: Node): NavItem[] {
    const navItem = this.getNavItemByElement(node as HTMLElement, true);
    if (navItem) {
      return [navItem];
    } else {
      if (node instanceof Element) {
        return Array.from(node.children)
          .map((child) => {
            return this.getNavItemByNodeRecursive(child);
          })
          .flat(1)
          .filter(Boolean);
      }
    }
    return [];
  }

  getNavItemById(id: string, silent = false): NavItem | undefined {
    const navItem = this.navItems.find((navItem) => navItem.navId === id);
    if (navItem) {
      return navItem;
    } else {
      if (!silent) {
        console.error('NavItem not found by id', id);
      }
      return undefined;
    }
  }

  addNavItem(navItem: NavItem): void {
    const id = navItem.navId;
    const findNavItem = this.navItems.find((navItem) => navItem.navId === id);
    if (findNavItem) {
      console.error('NavItem with id already exists', id);
      return;
    }
    this.navItems.push(navItem);
    console.log('addNavItem', navItem.navId)
  }

  removeNavItem(navItem: NavItem): void {
    console.log('removeNavItem', navItem.navId)
    this.navItems = this.navItems.filter((item) => item !== navItem);
  }
}

