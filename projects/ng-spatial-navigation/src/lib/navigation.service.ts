import { Injectable } from '@angular/core';
import { Debounce } from './decorators/debounce.decorator';
import { findCommonParent } from './utils/find-common-parent';
import { FocusableNavItem, NavItem } from './types/nav-item.type';
import { Direction } from './types/direction.type';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { FocusStatus } from './types/focus-status.type';
import { isBlockNavigation } from './type-guards/is-block-navigation';
import { debugLog } from './utils/debug';

import scrollIntoView from 'scroll-into-view-if-needed';

/**
 * When the elements start to appear on the page on the same page,
 * it waits for it to be formed and only then it is applied
 */
export const TIME_DEBOUNCE_FOCUS_IN_MS = 200;

@Injectable()
export class NavigationService {
  focusedNavItem: FocusableNavItem | undefined;

  private status: FocusStatus = 'waiting';

  private waitingId: string | undefined;

  private navItemsForCheckFocus: NavItem[] = [];

  constructor(
    private navigationItemsStoreService: NavigationItemsStoreService
  ) {
    debugLog('create NavigationService')
  }

  @Debounce(TIME_DEBOUNCE_FOCUS_IN_MS)
  markFocusForCheck(): void {
    if (this.status !== 'waiting' || this.navItemsForCheckFocus.length === 0) {
      this.navItemsForCheckFocus = [];
      return;
    }
    const commonParent = findCommonParent(...this.navItemsForCheckFocus);
    this.navItemsForCheckFocus = [];
    if (commonParent) {
      this.focusWithFind(commonParent);
    }
  }

  focusWithFind(navItem: NavItem): boolean {
    const findFocus = navItem.findFocus();
    if (findFocus) {
      this.focus(findFocus);
      return true;
    } else {
      return false;
    }
  }

  focus(navItem: FocusableNavItem): boolean {
    if (navItem === this.focusedNavItem) {
      return true;
    }
    debugLog(`move focus to element with id=${navItem.id}`);
    if (this.focusedNavItem) {
      this.focusedNavItem.unsetFocus(navItem);
    }
    this.focusedNavItem = navItem;

    scrollIntoView(this.focusedNavItem.el.nativeElement, {
      scrollMode: 'always',
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })

    // this.focusedNavItem.el.nativeElement.scrollIntoView();
    this.focusedNavItem.setFocus(() => this.focusedElementDestroyed());
    this.status = 'default';
    return true;
  }

  focusedElementDestroyed(): void {
    const findReplaceRecursive = (
      navItem: NavItem
    ): FocusableNavItem | undefined => {
      if (navItem && navItem.parent) {
        const replaceNavItem = navItem.parent.findReplace(navItem);
        if (replaceNavItem) {
          const findFocus = replaceNavItem.findFocus();
          if (findFocus) {
            return findFocus;
          }
          return findReplaceRecursive(replaceNavItem);
        }
        if (navItem.parent) {
          return findReplaceRecursive(navItem.parent);
        }
      }
      return;
    };

    if (this.focusedNavItem) {
      const replaceNavItem = findReplaceRecursive(this.focusedNavItem);
      if (replaceNavItem) {
        this.focus(replaceNavItem);
      }
    }
  }

  navigate(direction: Direction): boolean {
    const getFromDirectionRecursive = (
      currentItem: NavItem
    ): NavItem | undefined => {
      const directionDataWithFn = currentItem[direction];
      const directionDataWithElement =
        typeof directionDataWithFn === 'function'
          ? directionDataWithFn()
          : directionDataWithFn;
      if (isBlockNavigation(directionDataWithElement)) {
        return undefined;
      }
      const directionData =
        directionDataWithElement instanceof HTMLElement
          ? this.navigationItemsStoreService.getNavItemByElement(
              directionDataWithElement
            )
          : directionDataWithElement;
      const navItem =
        typeof directionData === 'string'
          ? this.navigationItemsStoreService.getNavItemById(directionData)
          : directionData;
      if (navItem === undefined) {
        if (currentItem.parent) {
          return getFromDirectionRecursive(currentItem.parent);
        } else {
          return;
        }
      } else {
        return navItem;
      }
    };

    const getNavItemInDirectionRecursive = (
      currentNavItem: NavItem
    ): FocusableNavItem | undefined => {
      if (!currentNavItem) {
        return;
      }
      const fromDirection = getFromDirectionRecursive(currentNavItem);
      if (fromDirection) {
        const findFocus = fromDirection.findFocus();
        if (findFocus) {
          return findFocus;
        } else {
          return getNavItemInDirectionRecursive(fromDirection);
        }
      }
      return;
    };

    if (this.focusedNavItem) {
      const elementToFocus = getNavItemInDirectionRecursive(
        this.focusedNavItem
      );
      if (elementToFocus && this.focus(elementToFocus)) {
        debugLog(`success navigate to ${direction} direction`);
        return true;
      } else {
        debugLog(`failure navigate to ${direction} direction`);
      }
    }
    return false;
  }

  afterContentInitNavItem(navItem: NavItem): void {
    if (this.status === 'waiting') {
      this.navItemsForCheckFocus.push(navItem);
      this.markFocusForCheck();
    } else if (
      this.status === 'waiting_id' &&
      this.waitingId &&
      this.waitingId === navItem.id
    ) {
      this.focusWithFind(navItem);
    }
  }
}
