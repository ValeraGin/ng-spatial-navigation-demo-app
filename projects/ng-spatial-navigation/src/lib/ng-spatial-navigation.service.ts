import { Injectable } from '@angular/core';
import { NavigationService } from './navigation.service';
import { setDebugLevel } from './utils/debug';
import { merge } from './utils/deep-merge';
import { DirectionType } from './types/directions.type';

@Injectable()
/**
 * Сервис для управления навигацией из приложения (мост между приложением и библиотекой навигации)
 */
export class NgSpatialNavigationService {
  constructor(private navigationService: NavigationService) {}

  /**
   * Снимает фокус если он есть и переводит в режим ожидания элемента
   *
   * @param id - айдишник элемента который нужно передать фокус
   *
   * @description ОСТОРОЖНО! Если элемента с таким идентификатором не найдется совсем,
   * то вы потеряете фокус, так что осторожнее с этим методом и используйте его только в тех случаях,
   * когда вы точно знаете что элемент с таким идентификатором появится в DOM и он будет декорирован директивой
   */
  waitForElement(id: string): void {
    this.navigationService.waitForElement(id);
  }

  waitElementInPlace(id: string): void {
    this.navigationService.waitFocusableElementInPlace(id);
  }

  /**
   * Устанавливает уровень логирования
   *
   * @param level - уровень логирования (по умолчанию 'no_debug')
   * @param level.no_debug - не логировать
   * @param level.error - логировать только ошибки
   * @param level.info - логировать ошибки и информационные сообщения
   */
  setDebugLevel(level: 'no_debug' | 'error' | 'info'): void {
    setDebugLevel(level);
  }

  /**
   * Возвращает элемент который в данный момент имеет фокус
   */
  getFocusedElement(): HTMLElement | undefined {
    return this.navigationService.focusedNavItem?.el?.nativeElement;
  }

  back(): void {
    this.navigationService.back();
  }

  /**
   * Когда пользователь нажимает кнопку назад, но навигация не может обработать это событие
   */
  setBackUnhandledCallback(cb: () => void): void {
    this.navigationService.backCallBack = cb;
  }

  setSettings(settings: Partial<NavigationService['settings']>): void {
    this.navigationService.settings = merge(
      this.navigationService.settings,
      settings
    ) as NavigationService['settings'];
  }

  /**
   * Устанавливает фокус на элемент
   *
   * @param element - Элемент на который нужно установить фокус.
   * Он должен быть декорирован директивой либо его ребенок,
   * который получит фокус если родительский элемент не декорирован
   */
  setFocus(element: NonNullable<DirectionType>): Promise<void> {
    return this.navigationService.setFocus(element);
  }
}
