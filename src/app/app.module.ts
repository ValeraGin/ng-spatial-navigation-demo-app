import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgSpatialNavigationModule } from 'ng-spatial-navigation';
import { HttpClientModule } from '@angular/common/http';
import { CategoryComponent } from './pages/category/category.component';
import { MainComponent } from './pages/main/main.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MovieCardComponent } from './pages/movie-card/movie-card.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { SideMenuComponent } from './layouts/main-layout/side-menu/side-menu.component';
import {RouteReuseStrategy} from "@angular/router";
import {CustomRouteReuseStrategy} from "./core/custom.route-reuse-strategy";

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    SideMenuComponent,
    MainComponent,
    ProfileComponent,
    MovieCardComponent,
    CategoryComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgSpatialNavigationModule],
  bootstrap: [AppComponent],
  // providers: [
  //   {
  //     provide: RouteReuseStrategy,
  //     useClass: CustomRouteReuseStrategy,
  //   },
  // ],
})
export class AppModule {}
