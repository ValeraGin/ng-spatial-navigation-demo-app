import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgSpatialNavigationModule } from 'ng-spatial-navigation';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgSpatialNavigationModule,
  ],
  // providers: [
  //   { provide: RouteReuseStrategy, useClass: ApelsinTVCustomRouteReuseStrategy },
  // ],
  bootstrap: [AppComponent],
})
export class AppModule {}
