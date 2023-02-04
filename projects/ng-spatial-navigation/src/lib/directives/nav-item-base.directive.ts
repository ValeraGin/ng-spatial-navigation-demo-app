import {
  AfterContentInit,
  Directive,
  ElementRef, EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional, Output,
  Renderer2,
  SimpleChanges,
  SkipSelf,
} from '@angular/core';
import { NavigationService } from '../navigation.service';
import { NavigationItemsStoreService } from '../navigation-items-store.service';
import {
  FocusableNavItem,
  LayerNavItem,
  NavItem,
} from '../types/nav-item.type';
import { Directions, DirectionType } from '../types/directions.type';
import { KeyboardService } from '../keyboard.service';
import { isMyChild } from '../utils/is-my-child';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NAV_LAYER_TOKEN } from '../token/nav-layer.token';
import { NavFocusableDirective } from "./nav-focusable.directive";

@Directive()
/**
 * Базовый класс для всех элементов навигации
 */
export abstract class NavItemBaseDirective
  implements OnDestroy, OnChanges, AfterContentInit, Directions {
  /**
   * Идентификатор элемента навигации
   */
  @Input() id: string | undefined;

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

  /**
   * Кастомный tabindex на элемент, чтобы менять последовательность навигации
   */
  @Input() tabIndex = -1;

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
  protected children: NavItem[] = [];

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

  constructor(
    protected navigationService: NavigationService,
    protected navigationItemsStoreService: NavigationItemsStoreService,
    protected keyboardService: KeyboardService,
    protected renderer: Renderer2,
    public el: ElementRef<HTMLElement>,
    @Optional()
    @SkipSelf()
    @Inject(NAV_ITEM_TOKEN)
    public parent: NavItem,
    @Optional()
    @SkipSelf()
    @Inject(NAV_LAYER_TOKEN)
    public parentLayer: LayerNavItem
  ) {
  }

  setHasFocus(): void {
    console.log('setHasFocus', this.el.nativeElement);
    this.vFocus.emit();
    this.hasFocus = true;
    if (this.parent) {
      this.parent.childFocusReceive(this);
    }
  }

  unsetHasFocus(nextFocus?: FocusableNavItem): void {
    console.log('unsetHasFocus', this.el.nativeElement);
    this.vBlur.emit();
    this.hasFocus = false;
    if (this.parent) {
      this.parent.childFocusLost(this, nextFocus);
    }
  }

  childFocusReceive(child: NavItem): void {
    this.memory = child;
    if (this.hasFocus) {
      // we already have focus - do nothing
      return
    }
    this.setHasFocus();
  }

  childFocusLost(child: NavItem, nextFocus: FocusableNavItem | undefined): void {
    if (!this.hasFocus) {
      console.error(this.id, 'we do not have focus, but we lost it - possible bug')
      return
    }
    if (nextFocus && isMyChild(this, nextFocus as any, 'parent')) {
      // my one child focus lost but another child get focus - do nothing
      return
    }
    this.unsetHasFocus(nextFocus);
  }

  registerChild(navItem: NavItem): void {
    this.children.push(navItem);
    this.children.sort(
      (a, b) =>
        // смотрим сначала кто выше, потом кто левее (если они на одном уровне)
        // рассчет происходит только один раз при регистрации потомка
        a.el.nativeElement.offsetTop - b.el.nativeElement.offsetTop || a.el.nativeElement.offsetLeft - b.el.nativeElement.offsetLeft
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
    this.navigationItemsStoreService.removeNavItem(this);
    if (this.parent) {
      this.parent.unRegisterChild(this);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      if (changes['id'].firstChange) {
        this.navigationItemsStoreService.addNavItem(this);
      } else {
        this.navigationItemsStoreService.changeNavItemId(
          this,
          changes['id'].previousValue
        );
      }
    }
  }

  ngAfterContentInit(): void {
    if (this.parent) {
      this.parent.registerChild(this);
    }
    this.navigationService.afterContentInitNavItem(this);
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
}
