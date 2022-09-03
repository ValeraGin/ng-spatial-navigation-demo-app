import { Injectable } from '@angular/core';
import { NavigationService } from './navigation.service';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { setDebugLevel } from './utils/debug';

@Injectable()
export class NgSpatialNavigationService {

  constructor(
    private navigationService: NavigationService,
    private navigationItemsStoreService: NavigationItemsStoreService
  ) {}

  setDebugLevel(level: 'no_debug' | 'error' | 'info'): void {
    setDebugLevel(level);
  }

  getFocusedElement(): HTMLElement | undefined {
    return this.navigationService.focusedNavItem?.el?.nativeElement;
  }

  setFocus(element: HTMLElement): boolean {
    const navItem =
      this.navigationItemsStoreService.getNavItemByElement(element);
    if (navItem) {
      return this.navigationService.focusWithFind(navItem);
    }
    return Array.from(element.children).some((child) => {
      return child instanceof HTMLElement && this.setFocus(child);
    });
  }
}
