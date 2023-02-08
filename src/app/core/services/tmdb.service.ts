import { HttpClient } from '@angular/common/http';
import { map, mergeMap, Observable } from 'rxjs';
import { MovieFullResponse } from './types/movie.type';
import { ListResponse, MovieShort } from './types/list.type';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  constructor(private http: HttpClient) {
  }


  getPosterUrl(path: string, width: number = 500) {
    return `https://image.tmdb.org/t/p/w${width}${path}`;
  }

  getList$(
    title: string,
    urlPart: string
  ): Observable<{ data: MovieShort[]; title: string; urlPart: string }> {
    return this.http.get<ListResponse>(
      `http://api.themoviedb.org/3/${urlPart}?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`
    ).pipe(
      map((data) => {
        return {
          title,
          urlPart,
          data: data.results.slice(0, 10),
        };
      })
    );
  }

  getCategoryMovies$(urlPart: string): Observable<MovieShort[]> {
    const url = `http://api.themoviedb.org/3/${urlPart}?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`;
    return this.http.get<ListResponse>(url + 'page=1').pipe(
      mergeMap((data) => {
        return this.http.get<ListResponse>(url + 'page=2').pipe(
          map((data2) => {
            return data.results.concat(data2.results);
          })
        );
      })
    );
  }

  getMovie$(id: string): Observable<MovieFullResponse> {
    return this.http.get<MovieFullResponse>(
      `http://api.themoviedb.org/3/movie/${id}?append_to_response=content_ratings,release_dates,external_ids&api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`
    );
  }
}
