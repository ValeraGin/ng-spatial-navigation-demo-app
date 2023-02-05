import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgSpatialNavigationModule } from 'ng-spatial-navigation';
import { HttpClientModule } from '@angular/common/http';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { MainComponent } from './main/main.component';
import { CategoryComponent } from './category/category.component';
import { ProfileComponent } from './profile/profile.component';
import { MovieCardComponent } from './movie-card/movie-card.component';

@NgModule({
  declarations: [
    AppComponent,
    SidemenuComponent,
    MainComponent,
    CategoryComponent,
    ProfileComponent,
    MovieCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgSpatialNavigationModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
