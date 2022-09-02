export function isMyChild<T extends { parent: T }>(me: any, child: T): boolean {
  return child.parent === me || (child.parent && isMyChild(me, child.parent));
}
