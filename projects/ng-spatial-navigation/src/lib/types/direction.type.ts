/**
 * Варианты направлений для перемещения по элементам
 *
 * вверх, вправо, вниз, влево, вперед, назад
 */
export const DIRECTIONS = [
  'up',
  'down',
  'left',
  'right',
  'tab',
  'tabshift',
] as const;

export type Direction = (typeof DIRECTIONS)[number];
