import { Directive, forwardRef, Input } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavItem } from '../types/nav-item.type';
import { Direction, DIRECTIONS } from '../types/direction.type';

/**
 * Получает элемент по направлению в гриде
 *
 * @param direction - направление
 * @param index - индекс текущего элемента
 * @param children - список элементов
 * @param gridRowSize - размер грида по горизонтали
 */
function gridDirectionFn(
  direction: Direction,
  index: number,
  children: NavItem[],
  gridRowSize: number
): NavItem | undefined {
  switch (direction) {
    case 'up':
      return index - gridRowSize >= 0
        ? children[index - gridRowSize]
        : undefined;
    case 'down':
      return index + gridRowSize < children.length
        ? children[index + gridRowSize]
        : index !== children.length - 1
        ? children[children.length - 1]
        : undefined;
    case 'right':
      return index !== children.length - 1 && (index + 1) % gridRowSize !== 0
        ? children[index + 1]
        : undefined;
    case 'left':
      return index !== 0 && index % gridRowSize !== 0
        ? children[index - 1]
        : undefined;
    case 'tab':
      return index + 1 < children.length ? children[index + 1] : undefined;
    case 'tabshift':
      return index - 1 >= 0 ? children[index - 1] : undefined;
  }
}

/**
 * Показать грид в консоли
 *
 * @param from - текущий элемент
 * @param to - элемент по направлению
 * @param children - все элементы
 * @param gridRowSize - размер грида по горизонтали
 */
function showGridInConsole(
  from: NavItem,
  to: NavItem | undefined,
  children: NavItem[],
  gridRowSize: number
) {
  const table = [];
  for (let i = 0; i < children.length; i += gridRowSize) {
    const line = children.slice(i, i + gridRowSize);
    table.push(
      line.map((item) => {
        return item.navId === from.navId
          ? `from: ${item.navId}`
          : item.navId === to?.navId
          ? `to: ${item.navId}`
          : item.navId;
      })
    );
  }
  // console.table(table);
}

@Directive({
  selector: '[navGrid]',
  providers: [
    {
      provide: NAV_ITEM_TOKEN,
      useExisting: forwardRef(() => NavGridDirective),
    },
  ],
})
/**
 * Директива грида
 *
 * Для работы с гридом необходимо указать размер грида по горизонтали
 *
 * @example
 * <div navGrid [gridRowSize]="3">
 *   <div navFocusable></div>
 *   <div navFocusable></div>
 *   <div navFocusable></div>
 *   <div navFocusable></div>
 *   <div navFocusable></div>
 * </div>
 */
export class NavGridDirective extends NavItemBaseDirective {
  override type = 'grid';

  /**
   * Размер грида по горизонтали
   */
  @Input() gridRowSize?: number;

  override initNavItem() {}

  initDirections(navItem: NavItem): void {
    const gridSize = this.gridRowSize ?? 2;
    const gridDirectionFnHelper = (
      direction: Direction
    ): NavItem | undefined => {
      const index = this.children.indexOf(navItem);
      const ret = gridDirectionFn(direction, index, this.children, gridSize);
      showGridInConsole(navItem, ret, this.children, gridSize);
      return ret;
    };
    for (const direction of DIRECTIONS) {
      navItem[direction] = gridDirectionFnHelper.bind(undefined, direction);
    }
  }

  removeDirections(navItem: NavItem): void {
    for (const direction of DIRECTIONS) {
      navItem[direction] = undefined;
    }
  }
}
