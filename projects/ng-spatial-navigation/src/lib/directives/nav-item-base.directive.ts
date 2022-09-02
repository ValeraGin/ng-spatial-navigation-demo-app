import {
  AfterContentInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { NavigationService } from '../navigation.service';
import { NavigationItemsStoreService } from '../navigation-items-store.service';
import { FocusableNavItem, NavItem } from '../types/nav-item.type';
import { Directions, DirectionType } from '../types/directions.type';
import { Direction } from '../types/direction.type';
import { KeyboardService } from '../keyboard.service';
import { isMyChild } from '../utils/is-my-child';

@Directive()
export abstract class NavItemBaseDirective implements OnDestroy, OnChanges, AfterContentInit, Directions {

  @Input() id: string | undefined;

  @Input() up: DirectionType;

  @Input() right: DirectionType;

  @Input() down: DirectionType;

  @Input() left: DirectionType;

  @Input() tab: DirectionType;

  @Input() tabshift: DirectionType;

  @Input() tabIndex: number = -1;

  abstract parent: NavItem;

  abstract navigationService: NavigationService;

  abstract navigationItemsStoreService: NavigationItemsStoreService;

  abstract renderer: Renderer2;

  abstract keyboardService: KeyboardService;

  memory?: NavItem;

  abstract el: ElementRef<HTMLElement>;

  protected children: NavItem[] = [];

  protected recoverDirections: Direction[] = ['down', 'up'];

  abstract initDirections(navItem: NavItem): void;

  abstract removeDirections(navItem: NavItem): void;

  childFocusReceive(child: NavItem) {
    this.memory = child;
    if (this.parent && !isMyChild(this, child)) {
      this.parent.childFocusReceive(this)
    }
  }

  childFocusLost(child: NavItem, nextFocus: FocusableNavItem) {
    if (this.parent && !isMyChild(this, child)) {
      this.parent.childFocusLost(this, nextFocus)
    }
  }

  registerChild(navItem: NavItem): void {
    this.children.push(navItem);
    this.children.sort((a, b) => a.el.nativeElement.offsetTop - b.el.nativeElement.offsetTop)
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
        this.navigationItemsStoreService.addNavItem(this)
      } else {
        this.navigationItemsStoreService.changeNavItemId(this, changes['id'].previousValue)
      }
    }
  }

  ngAfterContentInit(): void {
    if (this.parent) {
      this.parent.registerChild(this);
    }
    this.navigationService.afterContentInitNavItem(this);
  }

  findReplace(deletedItem: NavItem): NavItem | undefined {
    if (this.children.length < 2) {
      return undefined
    }
    const index = this.children.indexOf(deletedItem);
    if (index === 0) {
      return this.children[1]
    } else if (index === this.children.length - 1) {
      return this.children[this.children.length - 2]
    } else {
      return this.children[index + 1]
    }
  }

  findFocus(): FocusableNavItem | undefined {
    const listFindFocus = (): FocusableNavItem | undefined => {
      for (let i = 0; i < this.children.length; i++) {
        const findFocus = this.children[i].findFocus();
        if (findFocus) {
          return findFocus
        }
      }
      return undefined
    }
    return this.memory?.findFocus() || listFindFocus()
  }

}
