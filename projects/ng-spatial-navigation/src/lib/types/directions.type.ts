import { NavItem } from './nav-item.type';
import { Direction } from './direction.type';
import { blockNavigationToken } from '../consts/block-navigation-token.const';

export type DirectionProperties = Direction;

export type DirectionFn = () => NavItem | string | undefined;

export type BlockNavigation = typeof blockNavigationToken;

export type DirectionType = NavItem | HTMLElement |  string | DirectionFn | BlockNavigation | undefined ;

export type Directions = {
  [key in DirectionProperties]: DirectionType;
}
