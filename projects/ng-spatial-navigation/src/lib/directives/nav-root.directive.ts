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
/**
 * Директива корневого элемента
 *
 * Корневой элемент обязателен и он должен быть один и выше всех остальных элементов
 *
 * Если так произошло что внутри корневого элемента есть другой корневой элемент, то он становится просто слоем
 */
export class NavRootDirective extends NavLayerDirective {

  /**
   * Список всех корневых элемент
   *
   * В теории можно сделать несколько корневых элементов, но это не реализовано и заблокировано
   * Любой корневой элемент внутри другого корневого элемента превращается в слой первого,
   * сделано так для того, чтобы например в библиотеке можно было использовать корневой элемент,
   * так как библиотека не уверена что её основное приложение уже использует навигацию
   */
  static roots: NavRootDirective[] = [];

  /**
   * Включает или отключает навигацию по клавиатуре
   *
   * Но если есть другой рут элемент то навигация будет работать только на нем
   */
  @CoerceBoolean() @Input() isKeyboardNavigationEnabled : string | boolean = true;

  /**
   * Если установлен флаг, то будут слушаться события только на этом элементе, а не на всем документе
   *
   * NOTE: необходимо чтобы фокус быть внутри элемента, а это означает что нужно все фокусируемые
   * элементы делать с реальным фокусом что плохо для производительности. Поэтому этот флаг нельзя использовать!
   * Но в теории он может пригодиться!
   *
   * Нельзя менять в процессе работы! Должен быть константой!
   */
  @CoerceBoolean() @Input() noGlobal: string | boolean = false;

  /**
   * Флаг, который говорит что мы только слой, а не корневой элемент
   */
  private imFakeRoot = false;

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (NavRootDirective.roots.length > 0) {
      // Если есть другой рут элемент, то мы говорим что мы только слой а не корневой элемент,
      // но если мы одни, то значит мы корневой элемент
      this.imFakeRoot = true;
      return;
    }
    this.keyboardService.setRoot(this.el.nativeElement, !this.noGlobal);
    NavRootDirective.roots.push(this);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    // Если мы не настоящий корневой элемент, то ничего не делаем
    if (!this.imFakeRoot) {
      if (changes['isKeyboardNavigationEnabled']) {
        this.keyboardService.setStatus(
          changes['isKeyboardNavigationEnabled'].currentValue
        );
      }
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Если мы не настоящий корневой элемент, то ничего не делаем
    if (!this.imFakeRoot) {
      this.keyboardService.deleteRoot(this.el.nativeElement, !this.noGlobal);
      NavRootDirective.roots = NavRootDirective.roots.filter((root) => root !== this);
    }
  }
}

// global debug - show all nodes
// @ts-ignore
// window['showAllNavNodes'] = () => NavRootDirective.roots.forEach((root) => {
//   root.logTree()
// });
