import { Injectable } from '@angular/core';
import { Debounce } from './decorators/debounce.decorator';
import { findCommonParent } from './utils/find-common-parent';
import { FocusableNavItem, LayerNavItem, NavItem, RootNavItem } from './types/nav-item.type';
import { Direction } from './types/direction.type';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { FocusStatus } from './types/focus-status.type';
import { isBlockNavigation } from './type-guards/is-block-navigation';
import { debugError, debugGroupCollapsed, debugGroupEnd, debugLog, debugWarn } from './utils/debug';

import scrollIntoView, { Options } from 'scroll-into-view-if-needed';
import { BlockNavigation, DirectionType } from './types/directions.type';
import { isMyChild } from './utils/is-my-child';
import { DetectDomChangesService } from './detect-dom-changes.service';
import { KeyboardService } from './keyboard.service';

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

  root: RootNavItem | undefined;

  activeLayer: LayerNavItem | undefined;

  focusedNavItem: FocusableNavItem | undefined;

  /**
   * Колбек для обработки нажатия кнопки назад внутри приложения, когда не смогли сами обработать
   */
  backCallBack: (() => void) | undefined;

  /**
   * Статус фокуса
   */
  private _status: FocusStatus = 'waiting';
  get status(): FocusStatus {
    return this._status;
  }
  set status(value: FocusStatus) {
    this._status = value;
    debugLog('NavigationService.status', value);
  }

  /**
   * Идентификатор элемента, на который нужно перевести фокус когда он появится
   */
  private waitingId: string | undefined;

  /**
   * Идентификатор элемента, на который нужно перевести фокус когда он появится
   */
  private waitingNav: NavItem | undefined;

  /**
   * Список элементов, которые попадают в так называемый арбитраж на выбор кого фокусировать
   * Это происходит, когда несколько элементов находятся на одном уровне
   * и одновременно появляются на странице и фокуса до этого не было.
   *
   * Например, при старте приложения или при загрузке страницы когда нет других фокусируемых элементов
   */
  private navItemsForCheckFocus: NavItem[] = [];

  constructor(
    private navigationItemsStoreService: NavigationItemsStoreService,
    private keyboardService: KeyboardService,
    private detectDomChangesService: DetectDomChangesService
  ) {
    this.keyboardService.navigateCallback = (direction) => this.navigate(direction);
    this.keyboardService.backCallback = async () => this.back();
    this.keyboardService.enterCallback = async () => {
      const nativeElement = this.focusedNavItem?.el?.nativeElement;
      if (nativeElement) {
        nativeElement.click();
        return true;
      } else {
        debugWarn('Не найден элемент для клика');
        return false;
      }
    };
  }

  @Debounce(TIME_DEBOUNCE_FOCUS_IN_MS)
  markFocusForCheck(): void {
    if (
      (this.status !== 'waiting' && this.status !== 'waiting_focusable_in_place') ||
      this.navItemsForCheckFocus.length === 0
    ) {
      this.navItemsForCheckFocus = [];
      return;
    }
    debugGroupCollapsed('Пытаемся вернуть фокус, так как появились элементы для проверки');
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

  registerLayer(layer: LayerNavItem) {
    this.activeLayer = layer;
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

  unregisterLayer(layer: LayerNavItem) {
    if (this.activeLayer === layer) {
      this.activeLayer = undefined;
    }
  }

  registerRoot(root: RootNavItem) {
    this.root = root;
    this.keyboardService.setRoot(root.el.nativeElement, true);
    // this.detectDomChangesService.startObserver(root.el.nativeElement);
  }

  unregisterRoot(root: RootNavItem) {
    this.keyboardService.deleteRoot(root.el.nativeElement, true);
    // this.detectDomChangesService.stopObserver(root.el.nativeElement);
    this.root = undefined;
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
    debugGroupCollapsed('Смена фокуса');
    if (this.focusedNavItem) {
      if (navItem === this.focusedNavItem) {
        console.log('Фокус уже установлен на этом элементе');
        return true;
      }
      this.focusedNavItem.unsetFocus(navItem);
    }
    this.focusedNavItem = navItem;
    if (!this.settings.disableScrollGlobally && !this.focusedNavItem.noNeedScroll) {
      if (this.settings.useNativeScroll) {
        this.focusedNavItem.el.nativeElement.scrollIntoView();
      } else {
        scrollIntoView(this.focusedNavItem.el.nativeElement, this.settings.scrollIntoViewOptions);
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
          debugLog('Для установки нативного фокуса - он должен быть фокусабельным');
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
    this.focusedNavItem.setFocus();
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
    const findReplaceRecursive = (navItem: NavItem): FocusableNavItem | undefined => {
      if (
        navItem &&
        navItem.parent &&
        (navItem.parent.type === 'layer' || navItem.parent.type === 'root')
      ) {
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
        debugLog('Найден элемент для замены фокуса', replaceNavItem.el.nativeElement);
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

  async execDirection(
    direction: DirectionType,
    currentItem?: NavItem
  ): Promise<NavItem | BlockNavigation | undefined> {
    const directionDataWithElementOrPromise =
      typeof direction === 'function' ? direction(currentItem) : direction;
    const directionDataWithElement =
      directionDataWithElementOrPromise instanceof Promise
        ? await directionDataWithElementOrPromise
        : directionDataWithElementOrPromise;
    const directionData =
      directionDataWithElement instanceof HTMLElement
        ? this.navigationItemsStoreService.getNavItemByElement(directionDataWithElement)
        : directionDataWithElement;
    return typeof directionData === 'string'
      ? this.navigationItemsStoreService.getNavItemById(directionData)
      : directionData;
  }

  async navigate(direction: Direction): Promise<boolean> {
    const getFromDirectionRecursive = async (
      currentItem: NavItem
    ): Promise<NavItem | BlockNavigation | undefined> => {
      const navItem = await this.execDirection(currentItem.getDirection(direction), currentItem);
      if (navItem) {
        return navItem;
      }
      if (currentItem.parent) {
        return getFromDirectionRecursive(currentItem.parent);
      } else {
        return;
      }
    };

    const getNavItemInDirectionRecursive = async (
      currentNavItem: NavItem
    ): Promise<FocusableNavItem | undefined> => {
      if (!currentNavItem) {
        return;
      }
      const fromDirection = await getFromDirectionRecursive(currentNavItem);
      if (isBlockNavigation(fromDirection)) {
        debugLog(`Навигация в ${direction} направление заблокирована ${fromDirection.reason}`);
        return;
      }
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
      const elementToFocus = await getNavItemInDirectionRecursive(this.focusedNavItem);
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
    const targetNavItem = this.navigationItemsStoreService.getNavItemById(id, true);
    if (targetNavItem) {
      if (!this.focusWithFind(targetNavItem)) {
        debugError('Элемент найден, но не может принять фокус');
      }
      return;
    }
    if (this.status === 'default') {
      if (this.focusedNavItem) {
        this.focusedNavItem.unsetFocus();
      }
      this.focusedNavItem = undefined;
    }
    this.status = 'waiting_id';
    this.waitingId = id;
    console.log('Ожидаем элемент с идентификатором', id);
  }

  waitFocusableElementInPlace(id: string): void {
    const targetNavItem = this.navigationItemsStoreService.getNavItemById(id, true);

    if (targetNavItem === undefined) {
      console.log('Элемент для ожидания в нем фокусируемых элементов не найден');
      return;
    }

    if (this.status === 'default') {
      if (this.focusedNavItem) {
        this.focusedNavItem.unsetFocus();
      }
      this.focusedNavItem = undefined;
    }
    this.navItemsForCheckFocus = [targetNavItem];
    this.markFocusForCheck();
    this.status = 'waiting_focusable_in_place';
    this.waitingNav = targetNavItem;
    console.log('Ожидаем фокусируемый элемент внутри', targetNavItem.el.nativeElement);
  }

  navItemAppeared(navItem: NavItem): void {
    console.log('Появился элемент', navItem.el.nativeElement, 'parent', navItem.parent);
    switch (this.status) {
      case 'waiting':
        if (
          !this.activeLayer ||
          (this.activeLayer && isMyChild(this.activeLayer, navItem, 'parent'))
        ) {
          this.navItemsForCheckFocus.push(navItem);
          this.markFocusForCheck();
        }
        break;
      case 'waiting_id':
        if (
          !this.activeLayer ||
          (this.activeLayer && isMyChild(this.activeLayer, navItem, 'parent'))
        ) {
          this.navItemsForCheckFocus.push(navItem);
        }
        if (this.waitingId) {
          if (navItem.navId === this.waitingId) {
            if (!this.focusWithFind(navItem)) {
              debugError('Элемент найден, но не может принять фокус - переходим в waiting');
              this.status = 'waiting';
              this.markFocusForCheck();
            }
            return;
          }
        } else {
          console.error('Статус ожидания элемента, но нет идентификатора элемента - баг');
        }
        break;
      case 'waiting_focusable_in_place':
        if (isMyChild(this.waitingNav, navItem, 'parent')) {
          this.navItemsForCheckFocus.push(navItem);
        }
        this.markFocusForCheck();
        break;
      case 'default':
        // Ничего не делаем, так как фокус уже есть
        break;
    }
  }

  navItemDisappeared(navItem: NavItem) {
    if (navItem.hasFocus) {
      this.focusedElementDestroyed();
    }
  }

  async setFocus(direction: NonNullable<DirectionType>) {
    if (!direction) {
      console.error(
        'Пустой аргумент для setFocus! Пожалуйста, проверяйте что передаете в этот метод!'
      );
      return;
    }
    const navItem = await this.execDirection(direction);
    if (isBlockNavigation(navItem)) {
      throw new Error('Какой дурак додумался передавать в setFocus блокирующий элемент?');
    }
    if (navItem) {
      this.focusWithFind(navItem);
    } else {
      console.warn('Не удалось найти элемент для фокуса');
    }
  }
}
