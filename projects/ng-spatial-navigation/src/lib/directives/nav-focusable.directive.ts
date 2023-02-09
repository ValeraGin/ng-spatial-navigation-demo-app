import { Directive, forwardRef, HostListener, Input } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { FocusableNavItem } from '../types/nav-item.type';
import { NavListDirective } from './nav-list.directive';
import { CoerceBoolean } from '../decorators/coerce-boolean.decorator';

@Directive({
  selector: '[navFocusable]',
  providers: [
    {
      provide: NAV_ITEM_TOKEN,
      useExisting: forwardRef(() => NavFocusableDirective),
    },
  ],
})
/**
 * Директива, которая делает элемент навигационным
 * @example
 * <div navFocusable> Элемент, который может принять фокус </div>
 */
export class NavFocusableDirective extends NavListDirective {
  override type = 'focusable';

  /**
   * Функция, которая вызывается перед тем как фокус будет передан на этот элемент
   */
  @Input() willFocus: ((prevElement: HTMLElement) => boolean) | undefined;

  /**
   * Функция, которая вызывается перед тем как фокус будет передан с этого элемента
   */
  @Input() willBlur: ((nextElement: HTMLElement) => boolean) | undefined;

  /**
   * Флаг, который показывает находиться ли элемент в фокусе
   */
  focused: boolean | undefined;

  /**
   * Флаг, который показывает находиться ли элемент в фокусе
   */
  @CoerceBoolean() @Input() noNeedScroll: boolean | string | undefined;

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

  setFocus(): void {
    this.focused = true;
    this.renderer.addClass(this.el.nativeElement, 'focused');
    super.setHasFocus();
  }

  unsetFocus(nextFocus?: FocusableNavItem): void {
    this.focused = false;
    this.renderer.removeClass(this.el.nativeElement, 'focused');
    super.unsetHasFocus(nextFocus);
  }

}
