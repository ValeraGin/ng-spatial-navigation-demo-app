import { Injectable } from '@angular/core';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { debugError } from "./utils/debug";

/**
 * Сервис, который будет следить за дом и знать как DOM удаляется или добавляется
 *
 * Нужен при условии, что мы используем ReuseStrategy для роутов
 */
@Injectable()
export class DetectDomChangesService {
  observer: MutationObserver | undefined;

  constructor(private navigationItemsStore: NavigationItemsStoreService) {}

  startObserver(rootElement: HTMLElement) {
    if (this.observer) {
      this.stopObserver();
    }
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
              this.onAddedNode(node);
          });
          mutation.removedNodes.forEach((node) => {
              this.onRemovedNode(node);
          });
        }
      });
    });
    this.observer.observe(rootElement, {
      childList: true,
      subtree: true,
    });
  }

  stopObserver(htmlElement?: HTMLElement) {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private onAddedNode(node: Node) {
    // console.log('onAddedNode', node);
    const navItems =
      this.navigationItemsStore.getNavItemByNodeRecursive(node);
    navItems.forEach((navItem) => {
      // navItem.attachToParent();
    });
  }

  private onRemovedNode(node: Node) {
    // console.log('onRemovedNode', node);
   // debugger;
    const navItems =
      this.navigationItemsStore.getNavItemByNodeRecursive(node);
    navItems.forEach((navItem) => {
      // navItem.detachFromParent();
    });
  }
}
