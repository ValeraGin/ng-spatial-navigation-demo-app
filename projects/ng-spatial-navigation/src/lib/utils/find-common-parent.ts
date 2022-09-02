function getParentsWithItem<T extends { parent: T }>(item: T): T[] {
  if (!item) {
    return []
  } else {
    return [...getParentsWithItem(item.parent), item]
  }
}

export function findCommonParent<T extends { parent: T }>(...args: T[]): T | undefined {
  if (args.length < 1) {
    return undefined
  }
  if (args.length === 1) {
    return args[0].parent
  }
  const commonParents = args
    .map(getParentsWithItem)
    .reduce(((acc, parents) => {
      if (acc) {
        return parents.filter(value => acc.includes(value))
      } else {
        return parents
      }
    }))
  return commonParents[commonParents.length - 1]
}
