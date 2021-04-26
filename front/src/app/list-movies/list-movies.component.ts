import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { List } from 'libs/movie';
import { movieService } from '../_services/movie_service';
import { YTSService } from '../_services/yts_service';

@Component({
  selector: 'app-list-movies',
  template: `
    <div
      class="body"
      infiniteScroll
      [scrollWindow]="false"
      (scrolled)="onScrollDown()"
    >
      <app-filter-and-sort
        (sendParams)="this.getMovieListFilter($event)"
      ></app-filter-and-sort>
      <p>Films:</p>
      <div class="list">
        <div
          *ngFor="let movie of this.moviesList"
          (click)="viewDetail(movie.imdb_code)"
          class="movie-container"
        >
          <img src="{{ movie.poster }}" class="movie-img" />
          <p>{{ movie.title }} {{ movie.see == true ? '(Déjà vu)' : '' }}</p>
        </div>
        <mat-spinner class="spinner" *ngIf="this.loadingMovie"></mat-spinner>
      </div>
    </div>
  `,
  styleUrls: ['./list-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListMoviesComponent implements OnInit {
  public pageNum = 1;
  public moviesList = [];
  public loadingMovie = false;
  public paramsFilterSort: any;

  constructor(
    private YTSServices: YTSService,
    private cd: ChangeDetectorRef,
    private route: Router,
    private movieService: movieService
  ) {}

  ngOnInit(): void {
    this.getMovieList(this.pageNum);
  }

  onScrollDown() {
    this.getMovieList(++this.pageNum);
  }

  getMovieList(page: number) {
    this.loadingMovie = true;
    this.movieService
      .getListMovies(
        page,
        this.paramsFilterSort?.genre,
        'download_count',
        this.paramsFilterSort?.note
      )
      .subscribe(
        (data) => {
          if (!this.moviesList || this.moviesList.length == 0)
            this.moviesList = data.movies;
          else this.moviesList = this.moviesList.concat(data.movies);
          this.loadingMovie = false;
          console.log(data);
          this.cd.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getMovieListFilter(params: any) {
    this.pageNum = 0;
    this.paramsFilterSort = params;
    this.moviesList = [];
    this.getMovieList(this.pageNum);
  }

  viewDetail(imdb_code) {
    this.route.navigate(['/detail-movie/' + imdb_code]);
  }
}
