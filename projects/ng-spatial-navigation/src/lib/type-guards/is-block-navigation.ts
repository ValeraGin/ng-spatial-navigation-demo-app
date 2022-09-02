import { BlockNavigation, DirectionType } from '../types/directions.type';
import { blockNavigationToken } from '../consts/block-navigation-token.const';

export function isBlockNavigation(direction: DirectionType): direction is BlockNavigation {
  return (typeof direction === 'object') && 'blockNavigationToken' in direction
}
