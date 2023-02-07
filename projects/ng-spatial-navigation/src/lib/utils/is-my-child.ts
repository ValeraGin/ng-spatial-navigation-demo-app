/**
 * Проверяет является ли child моим потомком (рекурсивно) по указанному свойству parentProp
 *
 * Данный способ быстрее чем проверка от родителя к потомку
 *
 * @param me - элемент, который проверяется
 * @param child - потомок
 * @param parentProp - свойство которое сообщает о родителе (обычно это поле parent)
 */
export function isMyChild<
  ParentProp extends string,
  T extends { [key in ParentProp]: T }
>(me: any, child: T, parentProp: ParentProp): boolean {
  return (
    child[parentProp] === me ||
    (child[parentProp] && isMyChild(me, child[parentProp], parentProp))
  );
}
