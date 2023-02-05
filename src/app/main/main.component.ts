import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from './movie.interface';
import { map, mergeMap, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MainService } from './main.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  lines$: Observable<{ title: string; data: Movie[] }[]>;

  getPosterUrl(path: string) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private mainService: MainService
  ) {
    this.lines$ = this.activatedRoute.queryParams.pipe(
      map((params) => params['type'] as string),
      mergeMap((type) => this.mainService.getLinesByType(type as any))
    );
  }
}
