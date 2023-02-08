import { Injectable } from '@angular/core';
import { MovieResponse } from './movie.interface';
import { map, zip } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  constructor(private http: HttpClient) {
  }

  getLine(title: string, url: string) {
    return this.http.get<MovieResponse>(url).pipe(
      map((data) => {
        return {
          title,
          url,
          data: data.results.slice(0, 10),
        };
      })
    );
  }

  getLinesByType(type: 'movies' | 'tvs' | 'main' = 'main') {
    switch (type) {
      case 'movies':
        return zip([
          this.getLine(
            'Фильмы в кино',
            'https://api.themoviedb.org/3/movie/now_playing?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru-RU'
          ),
          // this.getLine(
          //   'Популярные фильмы',
          //   'https://api.themoviedb.org/3/trending/movie/day?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru-RU'
          // ),
          // this.getLine(
          //   'Фильмы в кино',
          //   'https://api.themoviedb.org/3/trending/movie/week?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru-RU'
          // ),
          // this.getLine(
          //   'Популярные фильмы',
          //   'https://api.themoviedb.org/3/movie/upcoming?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru-RU'
          // ),
        ]);
      case 'tvs':
        return zip([
          this.getLine(
            'Сериалы актуальные',
            'https://api.themoviedb.org/3/tv/popular?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru-RU'
          ),
          // this.getLine(
          //   'Сериалы популярные',
          //   'http://api.themoviedb.org/3/discover/tv?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru&sort_by=release_date.desc&year=2023&first_air_date_year=2023&vote_average.gte=7'
          // ),
        ]);
      default:
      case 'main':
        return zip([
          this.getLine(
            'Сейчас смотрят',
            'http://api.themoviedb.org/3/movie/now_playing?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru'
          ),
          // this.getLine(
          //   'Сегодня в тренде',
          //   'http://api.themoviedb.org/3/trending/movie/day?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru'
          // ),
          // this.getLine(
          //   'В тренде за неделю',
          //   'http://api.themoviedb.org/3/trending/movie/week?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru'
          // ),
          // this.getLine(
          //   'Смотрите в кинозалах',
          //   'http://api.themoviedb.org/3/movie/upcoming?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru'
          // ),
        ]);
    }
  }
}
