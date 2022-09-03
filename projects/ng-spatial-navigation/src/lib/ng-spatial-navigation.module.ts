import { NgModule } from '@angular/core';
import { NavListDirective } from './directives/nav-list.directive';
import { NavFocusableDirective } from './directives/nav-focusable.directive';
import { NavGridDirective } from './directives/nav-grid.directive';
import { NavRootDirective } from './directives/nav-root.directive';
import { NavLayerDirective } from './directives/nav-layer.directive';
import { NgSpatialNavigationService } from './ng-spatial-navigation.service';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { NavigationService } from './navigation.service';
import { KeyboardService } from './keyboard.service';

@NgModule({
  declarations: [
    NavListDirective,
    NavGridDirective,
    NavFocusableDirective,
    NavRootDirective,
    NavLayerDirective,
  ],
  imports: [],
  exports: [
    NavListDirective,
    NavGridDirective,
    NavFocusableDirective,
    NavRootDirective,
    NavLayerDirective,
  ],
  providers: [
    KeyboardService,
    NavigationService,
    NavigationItemsStoreService
  ]
})
export class NgSpatialNavigationModule {}

