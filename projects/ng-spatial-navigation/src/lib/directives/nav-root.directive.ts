import { Directive, forwardRef } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
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
   * Флаг, который говорит что мы только слой, а не корневой элемент
   */
  private imFakeRoot = false;

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (this.parentLayer) {
      // Если есть другой рут элемент, то мы говорим что мы только слой а не корневой элемент,
      // но если мы одни, то значит мы корневой элемент
      this.imFakeRoot = true;
      return;
    }
    this.navigationService.registerRoot(this);
  }


  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Если мы не настоящий корневой элемент, то ничего не делаем
    if (this.imFakeRoot) {
      return;
    }
    this.navigationService.unregisterRoot(this)
  }
}
