import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit {

    items = [
      { title: 'Гланая', link: '/main', queryParams: { type: 'main' } },
      { title: 'Фильмы', link: '/main', queryParams: { type: 'movies' } },
      { title: 'Сериалы', link: '/main', queryParams: { type: 'tvs' } },
      { title: 'Профиль', link: '/profile', queryParams: {  } },
      { title: 'Карточка фильма', link: '/movie-card', queryParams: {  } },
    ];

    constructor() { }

    ngOnInit(): void {
    }

  fullscreenToggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }
}
