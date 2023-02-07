import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent {

  constructor(private router: Router) {}

  items = [
    { title: 'Главная', link: '/main', queryParams: { type: 'main' } },
    { title: 'Фильмы', link: '/main', queryParams: { type: 'movies' } },
    { title: 'Сериалы', link: '/main', queryParams: { type: 'tvs' } },
    { title: 'Профиль', link: '/profile', queryParams: {} },
  ];

  fullscreenToggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }
}
