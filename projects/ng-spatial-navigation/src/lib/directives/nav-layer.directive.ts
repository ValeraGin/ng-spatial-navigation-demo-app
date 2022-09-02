import { Directive, ElementRef, forwardRef, Inject, Optional, Renderer2, SkipSelf } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavigationService } from '../navigation.service';
import { NavigationItemsStoreService } from '../navigation-items-store.service';
import { NavItem } from '../types/nav-item.type';
import { initDirectionsList, removeDirectionsList } from './nav-list.directive';
import { KeyboardService } from '../keyboard.service';
import { blockNavigationToken } from '../consts/block-navigation-token.const';

@Directive({
  selector: '[navLayer]',
  providers: [{provide: NAV_ITEM_TOKEN, useExisting: forwardRef(() => NavLayerDirective)}]
})
export class NavLayerDirective extends NavItemBaseDirective {

  override up  = blockNavigationToken;

  override right  = blockNavigationToken;

  override down  = blockNavigationToken;

  override left  = blockNavigationToken;

  prevMemory?: NavItem;

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

  override findReplace(deletedItem: NavItem): NavItem | undefined {
    const findReplace = super.findReplace(deletedItem);
    return findReplace || this.prevMemory;
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this.prevMemory = this.parent.memory;
    this.navigationService.focusWithFind(this);
  }

  initDirections(navItem: NavItem): void {
    return initDirectionsList(this.children, navItem)
  }

  removeDirections(navItem: NavItem): void {
    return removeDirectionsList(this.children, navItem)
  }

}
