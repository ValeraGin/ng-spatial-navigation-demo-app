import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { MainComponent } from './pages/main/main.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MovieCardComponent } from './pages/movie-card/movie-card.component';
import { CategoryComponent } from './pages/category/category.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: MainComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
    ],
  },
  {
    path: 'movie/:movieId',
    component: MovieCardComponent,
  },
  {
    path: 'category',
    component: CategoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
