import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map, mergeMap, Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import * as Movie from "./movie.interface";

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent {

  movie$: Observable<Movie.Response>;

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
    this.movie$ = this.activatedRoute.params.pipe(
      map((params) => params['movieId'] as string),
      mergeMap((id) => this.getMovie(id))
    );
  }

  getMovie(id: string): Observable<Movie.Response> {
    return this.http
      .get<Movie.Response>(`http://api.themoviedb.org/3/movie/${id}?append_to_response=content_ratings,release_dates,external_ids&api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
  }
}
