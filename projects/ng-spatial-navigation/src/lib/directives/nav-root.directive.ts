import { Directive, forwardRef, Input, SimpleChanges } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { CoerceBoolean } from '../decorators/coerce-boolean.decorator';
import { NavLayerDirective } from './nav-layer.directive';
import { NAV_LAYER_TOKEN } from '../token/nav-layer.token';

@Directive({
  selector: '[navRoot]',
  providers: [
    {
      provide: NAV_ITEM_TOKEN,
      useExisting: forwardRef(() => NavRootDirective),
    },
    {
      provide: NAV_LAYER_TOKEN,
      useExisting: forwardRef(() => NavRootDirective),
    },
  ],
})
export class NavRootDirective extends NavLayerDirective {
  static roots: NavRootDirective[] = [];

  @Input() isKeyboardNavigationEnabled = true;

  @CoerceBoolean() @Input() noGlobal: string | boolean = true;

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.keyboardService.setRoot(this.el.nativeElement, !!this.noGlobal);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['isKeyboardNavigationEnabled']) {
      this.keyboardService.setStatus(
        changes['isKeyboardNavigationEnabled'].currentValue
      );
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.keyboardService.deleteRoot(this.el.nativeElement);
  }
}
