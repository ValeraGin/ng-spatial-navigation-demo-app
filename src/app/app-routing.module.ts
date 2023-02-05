import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from "./main/main.component";
import { ProfileComponent } from "./profile/profile.component";
import { MovieCardComponent } from "./movie-card/movie-card.component";
import { SidemenuComponent } from "./sidemenu/sidemenu.component";

const routes: Routes = [{
  path: '',
  component: SidemenuComponent,
  children: [{
    path: 'main',
    component: MainComponent
  }, {
    path: 'profile',
    component: ProfileComponent
  }]
}, {
  path: 'movie-card',
  component: MovieCardComponent
}, {
  path: '',
  redirectTo: 'main',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
