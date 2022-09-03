export function isMyChild<
  ParentProp extends string,
  T extends { [key in ParentProp]: T }
>(me: any, child: T, parentProp: ParentProp): boolean {
  return (
    child[parentProp] === me ||
    (child[parentProp] && isMyChild(me, child[parentProp], parentProp))
  );
}
