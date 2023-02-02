import { Directive, forwardRef, Input } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavItem } from '../types/nav-item.type';
import { CoerceBoolean } from '../decorators/coerce-boolean.decorator';
import { Direction } from '../types/direction.type';
import { DirectionType } from '../types/directions.type';

export function setNav(
  navItem: NavItem,
  direction: Direction,
  value: DirectionType
): void {
  //if (!isBlockNavigation(navItem[direction])) {
    navItem[direction] = value;
  //}
}

export function initDirectionsList(
  children: NavItem[],
  navItem: NavItem,
  isHorizontal?: boolean
): void {
  const index = children.indexOf(navItem);
  const isFirst = index === 0;
  const isLast = index === children.length - 1;
  const prev = isFirst ? undefined : children[index - 1];
  const next = isLast ? undefined : children[index + 1];
  if (isHorizontal) {
    setNav(navItem, 'up', undefined);
    setNav(navItem, 'down', undefined);
    setNav(navItem, 'left', prev);
    setNav(navItem, 'right', next);
    if (prev) {
      setNav(prev, 'right', navItem);
    }
    if (next) {
      setNav(next, 'left', navItem);
    }
  } else {
    setNav(navItem, 'left', undefined);
    setNav(navItem, 'right', undefined);
    setNav(navItem, 'up', prev);
    setNav(navItem, 'down', next);
    if (prev) {
      setNav(prev, 'down', navItem);
    }
    if (next) {
      setNav(next, 'up', navItem);
    }
  }
}

export function removeDirectionsList(
  children: NavItem[],
  navItem: NavItem,
  isHorizontal?: boolean
): void {
  const index = children.indexOf(navItem);
  const isFirst = index === 0;
  const isLast = index === children.length - 1;
  const prev = isFirst ? undefined : children[index - 1];
  const next = isLast ? undefined : children[index + 1];
  if (isHorizontal) {
    if (prev) {
      setNav(prev, 'right', next);
    }
    if (next) {
      setNav(next, 'left', prev);
    }
  } else {
    if (prev) {
      setNav(prev, 'down', next);
    }
    if (next) {
      setNav(next, 'up', prev);
    }
  }
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
