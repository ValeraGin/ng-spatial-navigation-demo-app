import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit {

    items = [
      { title: 'Home', link: '/home' },
      { title: 'Movies', link: '/movies' },
      { title: 'TV Shows', link: '/tv-shows' },
      { title: 'My List', link: '/my-list' },
      { title: 'Kids', link: '/kids' },
      { title: 'DVD', link: '/dvd' },
    ];

    constructor() { }

    ngOnInit(): void {
    }
}
