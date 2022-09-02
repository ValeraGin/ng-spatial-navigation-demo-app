import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Input,
  Optional,
  Renderer2,
  SkipSelf
} from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavigationService } from '../navigation.service';
import { NavigationItemsStoreService } from '../navigation-items-store.service';
import { FocusableNavItem, NavItem } from '../types/nav-item.type';
import { initDirectionsList, removeDirectionsList } from './nav-list.directive';
import { KeyboardService } from '../keyboard.service';

@Directive({
  selector: '[navFocusable]',
  providers: [{provide: NAV_ITEM_TOKEN, useExisting: forwardRef(() => NavFocusableDirective)}]
})
export class NavFocusableDirective extends NavItemBaseDirective {

  @Input() willFocus: ((prevElement: HTMLElement) => boolean) | undefined;

  @Input() willUnFocus: ((nextElement: HTMLElement) => boolean) | undefined;

  focused: boolean | undefined;

  private beforeDestroy: (() => void) | undefined;

  constructor(
    @Optional() @SkipSelf() @Inject(NAV_ITEM_TOKEN) public parent: NavItem,
    public navigationService: NavigationService,
    public navigationItemsStoreService: NavigationItemsStoreService,
    public keyboardService: KeyboardService,
    public renderer: Renderer2,
    public el: ElementRef<HTMLElement>
  ) {
    super()
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void  {
    if (event.target === this.el.nativeElement) {
      event.preventDefault();
      if (!this.focused) {
        this.navigationService.focus(this)
      }
    }
  }

  override findFocus(): FocusableNavItem | undefined {
    return this
  }

  setFocus(beforeDestroy: NavFocusableDirective['beforeDestroy']) {
    this.beforeDestroy = beforeDestroy;
    this.focused = true;
    this.parent?.childFocusReceive(this);
    this.renderer.addClass(this.el.nativeElement, 'focused');
  }

  unsetFocus(nextFocus: FocusableNavItem) {
    this.beforeDestroy = undefined;
    this.focused = false;
    this.parent?.childFocusLost(this, nextFocus);
    this.renderer.removeClass(this.el.nativeElement, 'focused');
  }

  override ngOnDestroy(): void {
    if (this.beforeDestroy) {
      this.beforeDestroy()
    }
    super.ngOnDestroy();
  }


  initDirections(navItem: NavItem): void {
    return initDirectionsList(this.children, navItem)
  }

  removeDirections(navItem: NavItem): void {
    return removeDirectionsList(this.children, navItem)
  }

}
