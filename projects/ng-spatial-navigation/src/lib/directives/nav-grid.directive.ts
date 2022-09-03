import { Directive, forwardRef, Input } from '@angular/core';
import { NAV_ITEM_TOKEN } from '../token/nav-item.token';
import { NavItemBaseDirective } from './nav-item-base.directive';
import { NavItem } from '../types/nav-item.type';
import { Direction } from '../types/direction.type';

function initDirectionsGrid(
  children: NavItem[],
  navItem: NavItem,
  gridSize: number
): void {
  const getFromDirection = (direction: Direction): NavItem | undefined => {
    const index = children.indexOf(navItem);
    switch (direction) {
      case 'up':
        return index - gridSize >= 0 ? children[index - gridSize] : undefined;
      case 'down':
        return index + gridSize < children.length
          ? children[index + gridSize]
          : undefined;
      case 'right':
        return index !== children.length - 1 && (index + 1) % gridSize !== 0
          ? children[index + 1]
          : undefined;
      case 'left':
        return index !== 0 && index % gridSize !== 0
          ? children[index - 1]
          : undefined;
      case 'tab':
        return index + gridSize < children.length
          ? children[index + gridSize]
          : index !== children.length - 1 && (index + 1) % gridSize !== 0
          ? children[index + 1]
          : undefined;
      case 'tabshift':
        return index - gridSize >= 0
          ? children[index - gridSize]
          : index !== 0 && index % gridSize !== 0
          ? children[index - 1]
          : undefined;
    }
  };
  navItem.up = getFromDirection.bind(null, 'up');
  navItem.down = getFromDirection.bind(null, 'down');
  navItem.right = getFromDirection.bind(null, 'right');
  navItem.left = getFromDirection.bind(null, 'left');
}

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
export class NavGridDirective extends NavItemBaseDirective {
  @Input() gridRowSize?: number;

  initDirections(navItem: NavItem): void {
    return initDirectionsGrid(this.children, navItem, this.gridRowSize ?? 0);
  }

  removeDirections(navItem: NavItem): void {
    return removeDirectionsGrid(this.children, navItem, this.gridRowSize ?? 0);
  }
}
