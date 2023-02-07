import { Component } from '@angular/core';
import { Movie, MovieResponse } from '../main/movie.interface';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap, Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {
  movies$: Observable<Movie[]>;

  getPosterUrl(path: string) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
    this.movies$ = this.activatedRoute.queryParams.pipe(
      map((params) => params['url'] as string),
      mergeMap((category) => this.getCategoryMovies$(category))
    );
  }

  private getCategoryMovies$(url: string) {
    // merge data.results from two pages
    return this.http
      .get<MovieResponse>(
        url + 'page=1'
      ).pipe(
        mergeMap((data) => {
          return this.http
            .get<MovieResponse>(
              url + 'page=2'
            ).pipe(
              map((data2) => {
                return data.results.concat(data2.results);
              })
            );
        })
      );
  }
}
