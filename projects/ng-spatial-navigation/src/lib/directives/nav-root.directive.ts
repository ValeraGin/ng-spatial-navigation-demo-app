import {
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  Optional,
  Renderer2,
  SimpleChanges,
  SkipSelf
} from '@angular/core';
import { NavigationService } from '../navigation.service';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavigationItemsStoreService } from '../navigation-items-store.service';
import {  NavItem } from '../types/nav-item.type';
import {  initDirectionsList, removeDirectionsList } from './nav-list.directive';
import { KeyboardService } from '../keyboard.service';
import { CoerceBoolean } from '../decorators/coerce-boolean.decorator';

@Directive({
  selector: '[navRoot]',
  providers: [
    {provide: NAV_ITEM_TOKEN, useExisting: forwardRef(() => NavRootDirective)},
    NavigationService,
    KeyboardService,
    NavigationItemsStoreService
  ]
})
export class NavRootDirective extends NavItemBaseDirective {

  // TODO: multi roots
  static roots: NavRootDirective[] = [];

  @Input() isKeyboardNavigationEnabled = true;

  @CoerceBoolean() @Input() noGlobal: string | boolean = true;

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

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.keyboardService.setRoot(this.el.nativeElement, !!this.noGlobal);
  }

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes['isKeyboardNavigationEnabled']) {
      this.keyboardService.setStatus(changes['isKeyboardNavigationEnabled'].currentValue)
    }
  }

  initDirections(navItem: NavItem): void {
    return initDirectionsList(this.children, navItem)
  }

  removeDirections(navItem: NavItem): void {
    return removeDirectionsList(this.children, navItem)
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.keyboardService.deleteRoot(this.el.nativeElement);
  }

}
