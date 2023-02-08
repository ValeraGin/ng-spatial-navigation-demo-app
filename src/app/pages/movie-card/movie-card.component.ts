import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MovieFullResponse } from '../../core/services/types/movie.type';
import { TmdbService } from '../../core/services/tmdb.service';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent {
  movie$: Observable<MovieFullResponse>;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private tmdbService: TmdbService
  ) {
    this.movie$ = this.activatedRoute.params.pipe(
      map((params) => params['movieId'] as string),
      mergeMap((id) => this.tmdbService.getMovie$(id))
    );
  }
}
