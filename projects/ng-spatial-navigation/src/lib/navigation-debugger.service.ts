import { Injectable } from '@angular/core';
import { prettyPrint } from './utils/tree-pretty-print';
import { NavigationService } from './navigation.service';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { debugLog } from './utils/debug';

@Injectable()
export class NavigationDebuggerService {
  constructor(
    private navigationService: NavigationService,
    private navStoreService: NavigationItemsStoreService
  ) {}

  attachToWindow() {
    // @ts-ignore
    window['NavigationDebugger'] = {
      printRoot: () => this.printRoot(),
      printActiveLayer: () => this.printActiveLayer(),
      printNodes: () => this.printNodes(),
    };
    debugLog(
      'NavigationDebugger added to window. Use window.NavigationDebugger to access it'
    );
  }

  printActiveLayer() {
    prettyPrint(this.navigationService.activeLayer, 0);
  }

  printRoot() {
    prettyPrint(this.navigationService.root, 0);
  }

  printNodes() {
    console.table(
      this.navStoreService.navItems.map((navItem) => {
        return { id: navItem.navId, el: navItem.el.nativeElement };
      })
    );
  }
}
