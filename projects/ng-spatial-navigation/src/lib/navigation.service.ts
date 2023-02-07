import { Injectable } from '@angular/core';
import { Debounce } from './decorators/debounce.decorator';
import { findCommonParent } from './utils/find-common-parent';
import { FocusableNavItem, LayerNavItem, NavItem } from './types/nav-item.type';
import { Direction } from './types/direction.type';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { FocusStatus } from './types/focus-status.type';
import { isBlockNavigation } from './type-guards/is-block-navigation';
import { debugGroupCollapsed, debugGroupEnd, debugLog } from './utils/debug';

import scrollIntoView, { Options } from 'scroll-into-view-if-needed';
import { DirectionType } from './types/directions.type';
import { isMyChild } from "./utils/is-my-child";

/**
 * Время, которое дается элементам на отрисовку до передачи им фокуса (в миллисекундах)
 *
 * Если этого времени не достаточно и вы хотите ждать появления определенного элемента,
 * то используйте метод `waitForElement`
 */
export const TIME_DEBOUNCE_FOCUS_IN_MS = 200;

@Injectable()
export class NavigationService {
  settings = {
    scrollIntoViewOptions: {
      scrollMode: 'always',
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    } as Options,
    disableScrollGlobally: false,
    useNativeScroll: false,
    useRealFocus: false,
  };

  activeLayer: LayerNavItem | undefined;

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
    debugLog('create NavigationService');
  }

  @Debounce(TIME_DEBOUNCE_FOCUS_IN_MS)
  markFocusForCheck(): void {
    if (this.status !== 'waiting' || this.navItemsForCheckFocus.length === 0) {
      this.navItemsForCheckFocus = [];
      return;
    }
    debugGroupCollapsed(
      'Пытаемся вернуть фокус, так как появились элементы для проверки'
    );
    const commonParent = findCommonParent(...this.navItemsForCheckFocus);
    this.navItemsForCheckFocus = [];
    if (commonParent) {
      debugLog(
        'Общий родитель новых элементов - с него начинаем поиск',
        commonParent.el.nativeElement
      );
      if (this.focusWithFind(commonParent)) {
        debugLog('Фокус успешно приземлился на новый элемент');
      } else {
        debugLog(
          'Фокусу некуда было упасть - продолжаем ждать новых элементов способных принять фокус'
        );
      }
    }
    debugGroupEnd();
  }


  layerAppear(layer: LayerNavItem) {
    const findFocus = layer.findFocus();
    if (findFocus) {
      this.focus(findFocus);
    } else {
      // Произошел корнер кейс - слой появился, а в нем нет элементов, которые могут принять фокус
      if (this.focusedNavItem) {
        this.focusedNavItem.unsetFocus();
      }
      this.focusedNavItem = undefined;
      this.status = 'waiting';
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
    debugGroupCollapsed('Смена фокуса');
    if (this.focusedNavItem) {
      this.focusedNavItem.unsetFocus(navItem);
    }
    this.focusedNavItem = navItem;
    if (
      !this.settings.disableScrollGlobally &&
      !this.focusedNavItem.noNeedScroll
    ) {
      if (this.settings.useNativeScroll) {
        this.focusedNavItem.el.nativeElement.scrollIntoView();
      } else {
        scrollIntoView(
          this.focusedNavItem.el.nativeElement,
          this.settings.scrollIntoViewOptions
        );
      }
    }
    if (this.settings.useRealFocus) {
      this.focusedNavItem.el.nativeElement.focus();
      setTimeout(() => {
        if (document.activeElement !== this.focusedNavItem?.el.nativeElement) {
          debugLog(
            'Не удалось установить нативный фокус на элементе',
            this.focusedNavItem?.el.nativeElement
          );
          debugLog(
            'Для установки нативного фокуса - он должен быть фокусабельным'
          );
          /**
           * focusable elements are:
           *
           * form elements (input, select, textarea)
           * links (a)
           * buttons (button, input[type="button"], input[type="submit"])
           * details and summary element
           * elements with the "tabindex" attribute set to a positive integer
           */
        }
      });
    }
    this.focusedNavItem.setFocus(() => this.focusedElementDestroyed());
    this.status = 'default';
    debugGroupEnd();
    return true;
  }

  back(currentElement?: NavItem): boolean {
    currentElement = currentElement || this.focusedNavItem;
    const backNavItem = currentElement && currentElement.findBackward();
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
      if (navItem && navItem.parent && (navItem.parent.type === 'layer' || navItem.parent.type === 'root')) {
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
        debugLog(
          'Найден элемент для замены фокуса',
          replaceNavItem.el.nativeElement
        );
        this.focus(replaceNavItem);
      } else {
        // Произошло самое страшное - фокус ушел в никуда
        // Это нормально и этого не стоит бояться, так как когда появится элемент,
        // который может принять фокус, он будет найден
        console.warn('Фокус ушел в никуда');
        this.focusedNavItem = undefined;
        this.status = 'waiting';
      }
    }
  }

  async getDirection(direction: DirectionType): Promise<NavItem | undefined> {
    const directionDataWithElementOrPromise =
      typeof direction === 'function' ? direction() : direction;
    const directionDataWithElement =
      directionDataWithElementOrPromise instanceof Promise
        ? await directionDataWithElementOrPromise
        : directionDataWithElementOrPromise;
    if (isBlockNavigation(directionDataWithElement)) {
      debugLog(directionDataWithElement.reason);
      return undefined;
    }
    const directionData =
      directionDataWithElement instanceof HTMLElement
        ? this.navigationItemsStoreService.getNavItemByElement(
          directionDataWithElement
        )
        : directionDataWithElement;
    return typeof directionData === 'string'
      ? this.navigationItemsStoreService.getNavItemById(directionData)
      : directionData;
  }

  async navigate(direction: Direction): Promise<boolean> {
    const getFromDirectionRecursive = async (
      currentItem: NavItem
    ): Promise<NavItem | undefined> => {
      const navItem = await this.getDirection(currentItem[direction]);
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

    const getNavItemInDirectionRecursive = async (
      currentNavItem: NavItem
    ): Promise<FocusableNavItem | undefined> => {
      if (!currentNavItem) {
        return;
      }
      const fromDirection = await getFromDirectionRecursive(currentNavItem);
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
      const elementToFocus = await getNavItemInDirectionRecursive(
        this.focusedNavItem
      );
      if (elementToFocus && this.focus(elementToFocus)) {
        debugLog(`Успешно перешли в ${direction} направление`);
        return true;
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
    switch (this.status) {
      case 'waiting':
       if (!this.activeLayer || (this.activeLayer && isMyChild(this.activeLayer, navItem, 'parent'))) {
          this.navItemsForCheckFocus.push(navItem);
          this.markFocusForCheck();
        }
        break;
      case 'waiting_id':
        if (this.waitingId) {
          if (navItem.navId === this.waitingId) {
            this.focusWithFind(navItem);
          }
        } else {
          console.error(
            'Статус ожидания элемента, но нет идентификатора элемента - баг'
          );
        }
        break;
      case 'default':
        // Ничего не делаем, так как фокус уже есть
        break;
    }
  }


  async setFocus(direction: NonNullable<DirectionType>) {
    if (!direction) {
      console.error('Пустой аргумент для setFocus! Пожалуйста, проверяйте что передаете в этот метод!');
      return;
    }
    const navItem = await this.getDirection(direction);
    if (navItem) {
      this.focusWithFind(navItem);
    } else {
      console.warn('Не удалось найти элемент для фокуса');
    }
  }

}
