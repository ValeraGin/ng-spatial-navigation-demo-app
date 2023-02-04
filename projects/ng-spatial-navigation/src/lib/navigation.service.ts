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
 * Время, которое дается элементам на отрисовку до передачи им фокуса (в миллисекундах)
 *
 * Если этого времени не достаточно и вы хотите ждать появления определенного элемента,
 * то используйте метод `waitForElement`
 */
export const TIME_DEBOUNCE_FOCUS_IN_MS = 200;

@Injectable()
export class NavigationService {

  focusedNavItem: FocusableNavItem | undefined;

  /**
   * Колбек для обработки нажатия кнопки назад внутри приложения, когда не смогли сами обработать
   */
  backCallBack: (() => void) | undefined;

  /**
   * Статус фокуса
   */
  private status: FocusStatus = 'waiting';

  /**
   * Идентификатор элемента, на который нужно перевести фокус когда он появится
   */
  private waitingId: string | undefined;

  /**
   * Список элементов, которые попадают в так называемый арбитраж на выбор кого фокусировать
   * Это происходит, когда несколько элементов находятся на одном уровне
   * и одновременно появляются на странице и фокуса до этого не было.
   *
   * Например, при старте приложения или при загрузке страницы когда нет других фокусируемых элементов
   */
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
    console.trace(navItem.el.nativeElement, this.focusedNavItem?.el.nativeElement);
    if (navItem === this.focusedNavItem) {
      return true;
    }
    debugLog(`move focus to element with id=${navItem.navId}`);
    if (this.focusedNavItem) {
      this.focusedNavItem.unsetFocus(navItem);
    }
    this.focusedNavItem = navItem;

    if (!this.focusedNavItem.noNeedScroll) {
      scrollIntoView(this.focusedNavItem.el.nativeElement, {
        scrollMode: 'always',
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    }

    //this.focusedNavItem.el.nativeElement.scrollIntoView();

    //this.focusedNavItem.el.nativeElement.focus();
    this.focusedNavItem.setFocus(() => this.focusedElementDestroyed());
    this.status = 'default';
    return true;
  }

  back(currentElement?: NavItem): boolean {
    currentElement = currentElement || this.focusedNavItem;
    const backNavItem = currentElement && currentElement.findBackward()
    if (backNavItem) {
      const findFocus = backNavItem.findFocus();
      // Проверяем на зацикленность и то, что он вообще может принять фокус
      if (findFocus && findFocus !== currentElement && findFocus) {
        return this.focus(findFocus);
      } else if (backNavItem.parent) {
        return this.back(backNavItem.parent);
      }
    }
    if (this.backCallBack) {
      this.backCallBack();
      return true;
    }
    return false;
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
      if (replaceNavItem && replaceNavItem !== this.focusedNavItem) {
        console.log('Найден элемент для замены фокуса', replaceNavItem.el.nativeElement);
        this.focus(replaceNavItem);
      } else {
        // Произошло самое страшное - фокус ушел в никуда
        // Это нормально и этого не стоит бояться, так как когда появится элемент,
        // который может принять фокус, он будет найден
        console.log('Фокус ушел в никуда');
        this.focusedNavItem = undefined;
        this.status = 'waiting';
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

  /**
   * Снимает фокус если он есть и переводит в режим ожидания элемента
   *
   * @param id - айдишник элемента который нужно передать фокус
   *
   * @description ОСТОРОЖНО! Если элемента с таким идентификатором не найдется,
   * то вы потеряете фокус, так что осторожнее с этим методом
   */
  waitForElement(id: string): void {
    if (this.status === 'default') {
      if (this.focusedNavItem) {
        this.focusedNavItem.unsetFocus();
      }
      this.focusedNavItem = undefined;
    }
    this.status = 'waiting_id';
    this.waitingId = id;
  }

  afterContentInitNavItem(navItem: NavItem): void {
    if (this.status === 'waiting') {
      this.navItemsForCheckFocus.push(navItem);
      this.markFocusForCheck();
    } else if (
      this.status === 'waiting_id' &&
      this.waitingId &&
      this.waitingId === navItem.navId
    ) {
      this.focusWithFind(navItem);
    }
  }
}
