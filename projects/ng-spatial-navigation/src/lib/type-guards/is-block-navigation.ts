import { BlockNavigation, DirectionType } from '../types/directions.type';

/**
 * Проверяет, является ли направление блокировкой
 *
 * @param direction - направление для проверки
 */
export function isBlockNavigation(
  direction: DirectionType
): direction is BlockNavigation {
  return typeof direction === 'object' && 'type' in direction && direction.type === 'block'
}
