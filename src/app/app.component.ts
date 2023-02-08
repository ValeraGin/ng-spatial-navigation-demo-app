import { Component } from '@angular/core';
import { NgSpatialNavigationService } from 'ng-spatial-navigation';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private ngSpatialNavigationService: NgSpatialNavigationService,
    private location: Location
  ) {
    // Заметка: Элементы на которых есть свойство "back" берут на себя фокус при нажатии кнопки "назад"
    // А если таких элементов нет, то вызывается этот колбек
    ngSpatialNavigationService.setBackUnhandledCallback(() => {
      location.back();
    });
  }
}
