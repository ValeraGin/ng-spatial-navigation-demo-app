import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from './movie.interface';
import { map, mergeMap, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MainService } from './main.service';
import { NgSpatialNavigationService } from "ng-spatial-navigation";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  lines$: Observable<{ title: string; url: string, data: Movie[] }[]>;

  getPosterUrl(path: string) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private mainService: MainService,
    private ngSpatialNavigationService: NgSpatialNavigationService
  ) {
    console.log('main component')
    this.lines$ = this.activatedRoute.queryParams.pipe(
      map((params) => params['type'] as string),
      mergeMap((type) => this.mainService.getLinesByType(type as any)),
    );
  }

  ngOnInit(): void {
    this.ngSpatialNavigationService.setFocus(document.getElementById('movies-row-1_1')!);
  }
}
