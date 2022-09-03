import {
  Directive,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { FocusableNavItem } from '../types/nav-item.type';
import { NavListDirective } from './nav-list.directive';

@Directive({
  selector: '[navFocusable]',
  providers: [
    {
      provide: NAV_ITEM_TOKEN,
      useExisting: forwardRef(() => NavFocusableDirective),
    },
  ],
})
export class NavFocusableDirective extends NavListDirective {
  @Input() willFocus: ((prevElement: HTMLElement) => boolean) | undefined;

  @Input() willUnFocus: ((nextElement: HTMLElement) => boolean) | undefined;

  @Output() vFocus = new EventEmitter();

  @Output() vBlur = new EventEmitter();

  focused: boolean | undefined;

  private beforeDestroy: (() => void) | undefined;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.target === this.el.nativeElement) {
      event.preventDefault();
      if (!this.focused) {
        this.navigationService.focus(this);
      }
    }
  }

  override findFocus(): FocusableNavItem {
    return this;
  }

  setFocus(beforeDestroy: NavFocusableDirective['beforeDestroy']): void {
    this.beforeDestroy = beforeDestroy;
    this.focused = true;
    this.vFocus.emit();
    this.parent?.childFocusReceive(this);
    this.renderer.addClass(this.el.nativeElement, 'focused');
  }

  unsetFocus(nextFocus: FocusableNavItem): void {
    this.beforeDestroy = undefined;
    this.focused = false;
    this.vBlur.emit();
    this.parent?.childFocusLost(this, nextFocus);
    this.renderer.removeClass(this.el.nativeElement, 'focused');
  }

  override ngOnDestroy(): void {
    if (this.beforeDestroy) {
      this.beforeDestroy();
    }
    super.ngOnDestroy();
  }
}
