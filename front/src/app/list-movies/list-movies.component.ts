import { User } from './../../../libs/user';
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
import { AuthService } from '../_services/auth_service';

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
        [disabledButton]="this.loadingMovie"
        (sendParams)="this.getMovieListFilter($event)"
      ></app-filter-and-sort>
      <div class="list">
        <div
          *ngFor="let movie of this.moviesList"
          (click)="viewDetail(movie.imdb_code)"
          class="movie-container"
        >
          <img src="{{ movie.poster }}" class="movie-img" />
          <div class="bottom-container">
            <div class="movie-title" [title]="movie.title">
              {{ movie.title }} {{ movie.see == true ? '(Déjà vu)' : '' }}
            </div>
            <div class="movie-info">
              <div>{{ movie.year }}</div>
              <div *ngIf="movie.fav === false" (click)="this.sendToFav(movie)"><img src="./assets/icons8-plus.svg"></div>
              <div *ngIf="movie.fav === true" (click)="this.deleteFav(movie)"><img src="./assets/iconfinder_icon-ios7-heart-outline_211754.svg"></div>
              <div>
                {{ movie.runtime }}
              </div>
            </div>
          </div>
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
  public user: User;

  constructor(
    private YTSServices: YTSService,
    private cd: ChangeDetectorRef,
    private route: Router,
    private movieService: movieService,
    private auth_service: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
    this.getMovieList(this.pageNum);
  }

  sendToFav(movie: any) {
    this.movieService.addToFav(movie, this.user.id).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  deleteFav(movie: any) {
    this.movieService.deleteFav(movie, this.user.id).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onScrollDown() {
    if (!this.loadingMovie) {
      this.pageNum++;
    }
    console.log(this.pageNum);
    this.getMovieList(this.pageNum);
  }

  getMovieList(page: number) {
    if (!this.loadingMovie) {
      this.loadingMovie = true;
      this.cd.detectChanges();
      console.log(
        page,
        this.paramsFilterSort?.genre,
        'download_count',
        this.paramsFilterSort?.note,
        this.paramsFilterSort?.name
      );
      this.movieService
        .getListMovies(
          this.user.id,
          page,
          this.paramsFilterSort?.genre,
          'download_count',
          this.paramsFilterSort?.note,
          this.paramsFilterSort?.name
        )
        .subscribe(
          (data) => {
            if (!this.moviesList || this.moviesList.length === 0)
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
  }

  getMovieListFilter(params: any) {
    this.pageNum = 1;
    this.paramsFilterSort = params;
    this.moviesList = [];
    this.getMovieList(this.pageNum);
  }

  viewDetail(imdb_code) {
    this.route.navigate(['/detail-movie/' + imdb_code]);
  }
}
