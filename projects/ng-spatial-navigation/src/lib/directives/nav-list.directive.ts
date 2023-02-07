import { Directive, forwardRef, Input } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavItem } from '../types/nav-item.type';
import { CoerceBoolean } from '../decorators/coerce-boolean.decorator';
import { Direction } from '../types/direction.type';

/**
 * Получает элемент по направлению в листе
 *
 * @param direction - направление
 * @param index - индекс текущего элемента
 * @param children - список элементов
 * @param horizontal - признак горизонтального листа
 */
function getItemFromDirection(direction: Direction, index: number, children: NavItem[], horizontal: boolean): NavItem | undefined {
  switch (direction) {
    case 'up':
      return horizontal ? undefined : index - 1 >= 0 ? children[index - 1] : undefined;
    case 'down':
      return horizontal ? undefined : index + 1 < children.length ? children[index + 1] : undefined;
    case 'right':
      return horizontal ? index + 1 < children.length ? children[index + 1] : undefined : undefined;
    case 'left':
      return horizontal ? index - 1 >= 0 ? children[index - 1] : undefined : undefined;
    case 'tab':
      return index + 1 < children.length ? children[index + 1] : undefined;
    case 'tabshift':
      return index - 1 >= 0 ? children[index - 1] : undefined;
  }
}

/**
 * Показать лист в консоли
 *
 * @param from - текущий элемент
 * @param to - элемент по направлению
 * @param children - все элементы
 */
function showListInConsole(from: NavItem, to: NavItem | undefined, children: NavItem[]) {
  const output = children.map((item) =>
    item === from
      ? `from: ${item.navId}`
      : item === to
        ? `to: ${item.navId}`
        : item.navId
  );
  // console.table(output);
}

/**
 * Инициализация направлений для грида
 *
 * @param children - все элементы
 * @param navItem - текущий элемент
 */
function initDirectionsList(
  children: NavItem[],
  navItem: NavItem
  , horizontal: boolean): void {
  const getFromDirectionHelper = (direction: Direction): NavItem | undefined => {
    const index = children.indexOf(navItem);
    const ret = getItemFromDirection(direction, index, children, horizontal);
    showListInConsole(navItem, ret, children);
    return ret
  };

  navItem.up = getFromDirectionHelper.bind(null, 'up');
  navItem.down = getFromDirectionHelper.bind(null, 'down');
  navItem.right = getFromDirectionHelper.bind(null, 'right');
  navItem.left = getFromDirectionHelper.bind(null, 'left');
  navItem.tab = getFromDirectionHelper.bind(null, 'tab');
  navItem.tabshift = getFromDirectionHelper.bind(null, 'tabshift');
}

/**
 * Удаление направлений для
 *
 * @param children - все элементы
 * @param navItem - текущий элемент
 */
function removeDirectionsList(
  children: NavItem[],
  navItem: NavItem,
  horizontal: boolean
): void {
  navItem.up = undefined;
  navItem.down = undefined;
  navItem.right = undefined;
  navItem.left = undefined;
}


@Directive({
  selector: '[navList]',
  providers: [
    {
      provide: NAV_ITEM_TOKEN,
      useExisting: forwardRef(() => NavListDirective),
    },
  ],
})
/**
 * Элемент списка
 *
 * Он может быть либо горизонтальным, либо вертикальным. Это определяется атрибутом horizontal.
 *
 * Все элементы ведут себя как список (это их родительский класс) кроме грида
 *
 * @example
 * <div navList>
 *   <div navItem>1</div>
 *   <div navItem>2</div>
 *   <div navItem>3</div>
 *   <div navItem>4</div>
 * </div>
 */
export class NavListDirective extends NavItemBaseDirective {
  /**
   * Если true, то навигация будет горизонтальной (кнопки влево/вправо)
   */
  @CoerceBoolean() @Input() horizontal: boolean | string | undefined;

  initDirections(navItem: NavItem): void {
    return initDirectionsList(this.children, navItem, !!this.horizontal);
  }

  removeDirections(navItem: NavItem): void {
    return removeDirectionsList(this.children, navItem, !!this.horizontal);
  }
}
