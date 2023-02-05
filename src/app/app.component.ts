import { Component } from '@angular/core';
import { NgSpatialNavigationService } from "ng-spatial-navigation";
import { Location } from '@angular/common'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private ngSpatialNavigationService: NgSpatialNavigationService,
    private location: Location
  ) {

    ngSpatialNavigationService.setSettings({
      useRealFocus: true,
    });

    ngSpatialNavigationService.setBackUnhandledCallback(() => {
      // if (confirm('Хотите выйти?')) {
      //   window.close(); // or another way to close the app - it was just an example
      //   alert('Приложение закрыто')
      // } else {
        // Если мы на другой странице, то возвращаемся на уровень назад
        location.back();
      //}
    })
  }

}
