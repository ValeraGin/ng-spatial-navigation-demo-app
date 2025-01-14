import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  SimpleChanges,
  SkipSelf,
} from '@angular/core';
import { NavigationService } from '../navigation.service';
import { NavigationItemsStoreService } from '../navigation-items-store.service';
import { FocusableNavItem, LayerNavItem, NavItem } from '../types/nav-item.type';
import { Directions, DirectionType } from '../types/directions.type';
import { isMyChild } from '../utils/is-my-child';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NAV_LAYER_TOKEN } from '../token/nav-layer.token';
import { CoerceBoolean } from '../decorators/coerce-boolean.decorator';
import { debugLog } from '../utils/debug';
import { Direction } from '../types/direction.type';

@Directive()
/**
 * Базовый класс для всех элементов навигации
 */
export abstract class NavItemBaseDirective
  implements OnDestroy, OnChanges, AfterContentInit, OnInit, Directions
{
  type = 'base';

  /**
   * Идентификатор элемента навигации
   */
  @Input() navId: string | undefined;

  /**
   * Направление навигации вверх
   */
  @Input() up: DirectionType;

  /**
   * Направление навигации вправо
   */
  @Input() right: DirectionType;

  /**
   * Направление навигации вниз
   */
  @Input() down: DirectionType;

  /**
   * Направление навигации влево
   */
  @Input() left: DirectionType;

  /**
   * Направление навигации по Tab
   */
  @Input() tab: DirectionType;

  /**
   * Направление навигации по Shift + Tab
   */
  @Input() tabshift: DirectionType;

  internalDirections: Partial<Directions> = {};
  /**
   * Флаг, что надо останавливаться на этом элементе при навигации назад (если мы уже на нем не находимся)
   */
  @CoerceBoolean() @Input() back: boolean | string | undefined;
  /**
   * Флаг, что надо устанавливать класс has-focus для элемента при получении фокуса (включая дочерние элементы)
   */
  @CoerceBoolean() @Input() needSetHasFocusClass: boolean | string | undefined;
  /**
   * Событие, которое вызывается когда элемент, получает фокус
   */
  @Output() vFocus = new EventEmitter();
  /**
   * Событие, которое вызывается когда элемент, теряет фокус
   */
  @Output() vBlur = new EventEmitter();
  /**
   * элемент, который был активен до ухода из фокуса в списке дочерних элементов
   */
  memory?: NavItem;
  /**
   * флаг, что элемент в фокусе или его дочерний элемент в фокусе
   */
  hasFocus = false;
  /**
   * список дочерних элементов
   */
  children: NavItem[] = [];

  /**
   * флаг, что элемент был удален из DOM, но компонент жив (это происходит при использовании ReuseStrategy)
   */
  detachedFromDom = false;

  /**
   * Родительский элемент навигации
   */
  parent: NavItem;

  /**
   * Родительский слой
   */
  parentLayer: LayerNavItem;

  idIncrement: number = 0;

  isDestroyed = false;

  constructor(
    protected navigationService: NavigationService,
    protected navigationItemsStoreService: NavigationItemsStoreService,
    protected renderer: Renderer2,
    public el: ElementRef<HTMLElement>,
    @Optional()
    @SkipSelf()
    @Inject(NAV_ITEM_TOKEN)
    public parentToken: NavItem,
    @Optional()
    @SkipSelf()
    @Inject(NAV_LAYER_TOKEN)
    public parentLayerToken: LayerNavItem
  ) {
    this.parent = parentToken;
    this.parentLayer = parentLayerToken;
    this.initNavItem();
  }

  getDirection(direction: Direction): DirectionType {
    return this[direction] || this.internalDirections[direction];
  }

  /**
   * Родитель устанавливает направления для потомка
   *
   * Обычно это происходит при появлении потомка
   */
  abstract initDirections(navItem: NavItem): void;

  /**
   * Родитель удаляет направления для потомка
   *
   * Обычно это происходит при уничтожении потомка
   */
  abstract removeDirections(navItem: NavItem): void;

  abstract initNavItem(): void;

  setHasFocus(): void {
    this.vFocus.emit();
    this.hasFocus = true;
    debugLog('Элемент получил фокус', this.el.nativeElement);
    if (this.needSetHasFocusClass) {
      this.renderer.addClass(this.el.nativeElement, 'has-focus');
    }
    if (this.parent) {
      this.parent.childFocusReceive(this);
    }
  }

  unsetHasFocus(nextFocus?: FocusableNavItem): void {
    this.vBlur.emit();
    this.hasFocus = false;
    debugLog('Элемент потерял фокус', this.el.nativeElement);
    if (this.needSetHasFocusClass) {
      this.renderer.removeClass(this.el.nativeElement, 'has-focus');
    }
    if (this.parent) {
      this.parent.childFocusLost(this, nextFocus);
    }
  }

  childFocusReceive(child: NavItem): void {
    this.memory = child;
    if (this.hasFocus) {
      // мы уже имеем фокус - ничего не делаем
      return;
    }
    this.setHasFocus();
  }

  childFocusLost(child: NavItem, nextFocus: FocusableNavItem | undefined): void {
    if (!this.hasFocus) {
      console.error(this.navId, 'мы не имеем фокуса, но потомок потерял фокус - это баг');
      return;
    }
    if (nextFocus && isMyChild(this, nextFocus as any, 'parent')) {
      // мой один из детей потерял фокус, а другой получил фокус
      // - ничего не делаем, так как у родителя он остается все равно
      return;
    }
    this.unsetHasFocus(nextFocus);
  }

  registerChild(navItem: NavItem): void {
    if (this.isDestroyed) {
      console.error(this.navId, 'пытаемся зарегистрировать потомка, но мы уже уничтожены');
      return;
    }

    if (this.children.find((child) => child === navItem)) {
      console.error(this.navId, 'пытаемся зарегистрировать потомка, но он уже зарегистрирован');
      return;
    }

    this.children.push(navItem);
    this.children.sort(
      (a, b) =>
        // смотрим сначала кто выше, потом кто левее (если они на одном уровне)
        // расчет происходит только один раз при регистрации потомка
        a.el.nativeElement.offsetTop - b.el.nativeElement.offsetTop ||
        a.el.nativeElement.offsetLeft - b.el.nativeElement.offsetLeft
    );
    this.initDirections(navItem);
  }

  unRegisterChild(navItem: NavItem): void {
    if (this.memory === navItem) {
      this.memory = this.findReplace(navItem);
    }
    this.removeDirections(navItem);
    const index = this.children.indexOf(navItem);
    this.children.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.disappearance();
    this.navigationItemsStoreService.removeNavItem(this);
    this.isDestroyed = true;
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    if (!this.navId) {
      this.navId =
        this.el.nativeElement.id || (this.parent && this.parent.generateIdForChild(this));
    }
    this.navigationItemsStoreService.addNavItem(this);
  }

  ngAfterViewInit(): void {
    this.appearance();
  }
  ngAfterContentInit(): void {
    // console.log('ngAfterContentInit', this.navId);
  }

  findBackward(child?: NavItem): NavItem | undefined {
    // Если мы принимаем бек, то возвращаем себя
    if (this.back) {
      return this;
    }
    // Если мы не принимаем бек, то ищем бек у своих детей до того кто сам просил бек
    if (child && this.children.length) {
      const index = this.children.indexOf(child);
      for (let i = index - 1; i >= 0; i--) {
        if (this.children[i].back) {
          return this.children[i];
        }
      }
    }
    // Если есть родитель, то пусть он уже сам ищет бек, так как мы не нашли его
    if (this.parent) {
      return this.parent.findBackward(this);
    }
    return undefined;
  }

  /**
   * Поиск элемента, который должен получить фокус после удаления элемента
   * @param deletedItem - удаленный элемент
   */
  findReplace(deletedItem: NavItem): NavItem | undefined {
    if (this.children.length < 2) {
      return undefined;
    }
    const index = this.children.indexOf(deletedItem);
    if (index === 0) {
      return this.children[1];
    } else if (index === this.children.length - 1) {
      return this.children[this.children.length - 2];
    } else {
      return this.children[index + 1];
    }
  }

  /**
   * Поиск элемента, который должен получить фокус
   */
  findFocus(): FocusableNavItem | undefined {
    const listFindFocus = (): FocusableNavItem | undefined => {
      for (const item of this.children) {
        const findFocus = item.findFocus();
        if (findFocus) {
          return findFocus;
        }
      }
      return undefined;
    };
    return this.memory?.findFocus() || listFindFocus();
  }

  generateIdForChild(child: NavItem): string {
    return `${this.navId}-${this.idIncrement++}`;
  }

  attachToDom(): void {
    if (!this.detachedFromDom) {
      return;
    }
    this.detachedFromDom = false;
    console.log('attachToDom me -', this.navId, 'parent -', this.parent.navId);
    this.appearance();
  }

  detachFromDom(): void {
    if (this.detachedFromDom) {
      return;
    }
    this.detachedFromDom = true;
    console.log('detachFromDom me -', this.navId, 'parent -', this.parent.navId);
    this.disappearance();
  }

  appearance(): void {
    console.log('%c%s', 'color: green', 'appearance', this.navId, this.parent?.navId);
    if (this.parent) {
      this.parent.registerChild(this);
    }
    this.navigationService.navItemAppeared(this);
  }

  disappearance(): void {
    if (this.parent) {
      this.parent.unRegisterChild(this);
    }
    this.navigationService.navItemDisappeared(this);
  }
}
