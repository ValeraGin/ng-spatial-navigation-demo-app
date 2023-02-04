import { Directive, forwardRef, Input } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavItem } from '../types/nav-item.type';
import { Direction } from '../types/direction.type';

/**
 * Получает элемент по направлению в гриде
 *
 * @param direction - направление
 * @param index - индекс текущего элемента
 * @param children - список элементов
 * @param gridRowSize - размер грида по горизонтали
 */
function getItemFromDirection(direction: Direction, index: number, children: NavItem[], gridRowSize: number): NavItem | undefined {
  switch (direction) {
    case 'up':
      return index - gridRowSize >= 0 ? children[index - gridRowSize] : undefined;
    case 'down':
      return index + gridRowSize < children.length
        ? children[index + gridRowSize]
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
      return index + gridRowSize < children.length
        ? children[index + gridRowSize]
        : index !== children.length - 1 && (index + 1) % gridRowSize !== 0
          ? children[index + 1]
          : undefined;
    case 'tabshift':
      return index - gridRowSize >= 0
        ? children[index - gridRowSize]
        : index !== 0 && index % gridRowSize !== 0
          ? children[index - 1]
          : undefined;
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
function showGridInConsole(from: NavItem, to: NavItem | undefined, children: NavItem[], gridRowSize: number) {
  const table = [];
  for (let i = 0; i < children.length; i += gridRowSize) {
    const line = children.slice(i, i + gridRowSize);
    table.push(line.map((item) => {
      return item.navId === from.navId ? `from: ${item.navId}` : item.navId === to?.navId ? `to: ${item.navId}` : item.navId;
    }))
  }
  console.table(table);
}

/**
 * Инициализация направлений для грида
 *
 * @param children - все элементы
 * @param navItem - текущий элемент
 * @param gridSize - размер грида по горизонтали
 */
function initDirectionsGrid(
  children: NavItem[],
  navItem: NavItem,
  gridSize: number
): void {
  const getFromDirectionHelper = (direction: Direction): NavItem | undefined => {
    const index = children.indexOf(navItem);
    const ret = getItemFromDirection(direction, index, children, gridSize);
    showGridInConsole(navItem, ret, children, gridSize);
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
 * Удаление направлений для грида
 *
 * @param children - все элементы
 * @param navItem - текущий элемент
 * @param gridSize - размер грида по горизонтали
 */
function removeDirectionsGrid(
  children: NavItem[],
  navItem: NavItem,
  gridSize: number
): void {
  navItem.up = undefined;
  navItem.down = undefined;
  navItem.right = undefined;
  navItem.left = undefined;
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

  /**
   * Размер грида по горизонтали
   */
  @Input() gridRowSize?: number;

  initDirections(navItem: NavItem): void {
    return initDirectionsGrid(this.children, navItem, this.gridRowSize ?? 0);
  }

  removeDirections(navItem: NavItem): void {
    return removeDirectionsGrid(this.children, navItem, this.gridRowSize ?? 0);
  }
}
