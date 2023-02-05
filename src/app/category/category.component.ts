import { Component, OnInit } from '@angular/core';
import { Movie, MovieResponse } from '../main/movie.interface';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {
  movies: Movie[] = [];

  getPosterUrl(path: string) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  private fetchData() {
    this.http
      .get<MovieResponse>(
        'https://api.themoviedb.org/3/movie/now_playing?api_key=4ef0d7355d9ffb5151e987764708ce96&language=en-US&page=1'
      )
      .subscribe((data) => {
        this.movies = data.results;
      });
  }
}
