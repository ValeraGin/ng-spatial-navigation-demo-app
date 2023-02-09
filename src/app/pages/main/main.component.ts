import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap, Observable, tap, zip } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../../core/services/tmdb.service';
import { TmdbMainPageData } from '../../core/services/data/tmdb-main-page.data';
import { MovieShort } from '../../core/services/types/list.type';
import { NgSpatialNavigationService } from 'ng-spatial-navigation';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {

  pageTitle = 'Главная';

  lines$: Observable<{ title: string; urlPart: string; data: MovieShort[] }[]>;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    public tmdbService: TmdbService,
    private ngSpatialNavigationService: NgSpatialNavigationService
  ) {
    this.lines$ = this.activatedRoute.queryParams.pipe(
      map((params) => {
        let type = params['type'] as keyof typeof TmdbMainPageData;
        switch (type) {
          case 'main':
            this.pageTitle = 'Главная';
            break;
          case 'films':
            this.pageTitle = 'Фильмы';
            break;
          case 'shows':
            this.pageTitle = 'Сериалы';
            break;
        }
        return TmdbMainPageData[type] || TmdbMainPageData.main.slice(0, 2)
      }),
      mergeMap((arr) => {
        return zip(
          arr.map(([urlPart, title]) => {
            return this.tmdbService.getList$(title, urlPart);
          }).slice(0, 1)
        );
      }),
      tap((lines) => {
        // После обновления данных ждем пока отрендерится первый ряд и отфокусируем его
        if (lines && lines.length > 0) {
          console.log('MainComponent.lines$.tap(  ) - waitElementInPlace');
          this.ngSpatialNavigationService.waitElementInPlace('focus-me')
        }
      })
    );
  }

}
