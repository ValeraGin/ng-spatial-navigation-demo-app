import { NgModule } from '@angular/core';
import { NavListDirective } from './directives/nav-list.directive';
import { NavFocusableDirective } from './directives/nav-focusable.directive';
import { NavGridDirective } from './directives/nav-grid.directive';
import { NavRootDirective } from './directives/nav-root.directive';
import { NavLayerDirective } from './directives/nav-layer.directive';
import { NavigationItemsStoreService } from './navigation-items-store.service';
import { NavigationService } from './navigation.service';
import { KeyboardService } from './keyboard.service';
import { NgSpatialNavigationService } from './ng-spatial-navigation.service';
import { DetectDomChangesService } from './detect-dom-changes.service';
import { NavigationDebuggerService } from "./navigation-debugger.service";

/**
 * Модуль для работы с навигацией по элементам
 *
 * @example
 *
 * // app.module.ts
 *
 * import { NgSpatialNavigationModule } from 'ng-spatial-navigation';
 *
 * \@NgModule({
 *  declarations: [
 *    AppComponent
 *  ],
 *  imports: [
 *    BrowserModule,
 *    NgSpatialNavigationModule
 *  ],
 *  providers: [],
 *  bootstrap: [AppComponent]
 *  })
 *  export class AppModule { }
 *
 *  // app.component.ts
 *
 *  import { Component } from '@angular/core';
 *  import { NavigationService } from 'ng-spatial-navigation';
 *
 *  \@Component({
 *    selector: 'app-root',
 *    templateUrl: './app.component.html',
 *    styleUrls: ['./app.component.scss']
 *  })
 *  export class AppComponent {
 *    title = 'app';
 *
 *  constructor(
 *    private navigationService: NgSpatialNavigationService // just for DI example
 *  ) {}
 *
 *  // app.component.html
 *
 *  <div navGrid>
 *    <div navFocusable>1</div>
 *    <div navFocusable>2</div>
 *    <div navFocusable>3</div>
 *    <div navFocusable>4</div>
 *    <div navFocusable>5</div>
 *  </div>
 *
 *  // app.component.scss
 *
 *   // when element is focused it will have class 'focused' not pseudo-class :focus
 *  .focused {
 *    outline: 1px solid red;
 *  }
 *
 */
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
    NavigationItemsStoreService,
    DetectDomChangesService,
    NgSpatialNavigationService,
    NavigationDebuggerService,
  ],
})
export class NgSpatialNavigationModule {
  private static instance: any;

  constructor(private navigationDebuggerService: NavigationDebuggerService) {
    if (NgSpatialNavigationModule.instance) {
      throw new Error(
        'NgSpatialNavigationModule is already loaded. Import it in the AppModule only'
      );
    }
    NgSpatialNavigationModule.instance = this;

    navigationDebuggerService.attachToWindow();
  }
}
