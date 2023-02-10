import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap, Observable, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MovieShort } from '../../core/services/types/list.type';
import { TmdbService } from '../../core/services/tmdb.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  pageTitle = '';

  movies$: Observable<MovieShort[]>;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    public tmdbService: TmdbService,
    private cd: ChangeDetectorRef
  ) {
    this.movies$ = this.activatedRoute.queryParams.pipe(
      tap((params) => {
        this.pageTitle = params['title'] as string;
        this.cd.markForCheck();
      }),
      map((params) => params['urlPart'] as string),
      mergeMap((urlPart) => this.tmdbService.getCategoryMovies$(urlPart))
    );
  }

  ngOnInit(): void {
    console.log('CategoryComponent.ngOnInit()');
  }

  ngOnDestroy(): void {
    console.log('CategoryComponent.ngOnDestroy()');
  }
}
