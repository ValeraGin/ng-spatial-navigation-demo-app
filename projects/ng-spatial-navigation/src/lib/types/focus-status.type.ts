/**
 * Состояние фокуса внутри сервиса
 *
 * `waiting` - фокуса нет, ждем появления элементов
 * `waiting_id` - фокуса нет, ждем появления элемента с определенным id
 * `default` - фокус установлен
 */
export type FocusStatus =
  | 'waiting'
  | 'waiting_id'
  | 'default';
