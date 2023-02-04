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
import { CoerceBoolean } from "../decorators/coerce-boolean.decorator";

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

  /**
   * Функция, которая вызывается перед тем как фокус будет передан на этот элемент
   */
  @Input() willFocus: ((prevElement: HTMLElement) => boolean) | undefined;

  /**
   * Функция, которая вызывается перед тем как фокус будет передан с этого элемента
   */
  @Input() willUnFocus: ((nextElement: HTMLElement) => boolean) | undefined;

  /**
   * Флаг, который показывает находиться ли элемент в фокусе
   */
  focused: boolean | undefined;

  /**
   * Флаг, который показывает находиться ли элемент в фокусе
   */
  @CoerceBoolean() @Input() noNeedScroll: boolean | string | undefined;

  /**
   * Функция, которая вызывается перед уничтожением элемента когда он находится в фокусе
   *
   * Нужно чтобы не потерять фокус при уничтожении элемента в фокусе
   */
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

  setFocus(beforeDestroy: FocusableNavItem['beforeDestroy']): void {
    this.beforeDestroy = beforeDestroy;
    this.focused = true;
    this.renderer.addClass(this.el.nativeElement, 'focused');
    super.setHasFocus();
  }

  unsetFocus(nextFocus?: FocusableNavItem): void {
    this.beforeDestroy = undefined;
    this.focused = false;
    this.renderer.removeClass(this.el.nativeElement, 'focused');
    super.unsetHasFocus(nextFocus);
  }

  override ngOnDestroy(): void {
    if (this.beforeDestroy) {
      this.beforeDestroy();
    }
    super.ngOnDestroy();
  }
}
