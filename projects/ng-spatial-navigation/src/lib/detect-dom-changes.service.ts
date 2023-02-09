import { Injectable } from '@angular/core';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { NavItem } from "./types/nav-item.type";

/**
 * Сервис, который будет следить за дом и знать как DOM удаляется или добавляется
 *
 * Нужен при условии, что мы используем ReuseStrategy для роутов
 */
@Injectable()
export class DetectDomChangesService {

  observer: MutationObserver | undefined;

  deletedNodes = new Map<Node, NavItem[]>();

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
    const navItems = this.deletedNodes.get(node);
    navItems?.forEach((navItem) => {
      navItem.attachToDom();
    });
    this.deletedNodes.delete(node);
  }

  private onRemovedNode(node: Node) {
    const navItems = this.navigationItemsStore.getNavItemByNodeRecursive(node);
    this.deletedNodes.set(node, navItems);
    navItems.forEach((navItem) => {
      navItem.detachFromDom();
    });
  }
}
