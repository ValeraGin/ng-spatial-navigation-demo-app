export interface Tree {
  navId: string | undefined
  children?: Tree[];
}

export const prettyPrint = (tree: Tree, depth: number) => {
  if (depth === 0) {
    console.log('// ' + tree.navId);
  } else if (depth === 1) {
    console.log(`// |${'────'.repeat(depth)} ${tree.navId}`);
  } else {
    console.log(`// |${'    '.repeat(depth - 1)} |──── ${tree.navId}`);
  }

  if (tree.children) {
    tree.children.forEach((curr) => prettyPrint(curr, depth + 1));
  }
};
