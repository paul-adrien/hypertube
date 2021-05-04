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
        <div *ngFor="let movie of this.moviesList" class="movie-container">
          <img
            class="plus"
            *ngIf="movie.fav === false"
            (click)="this.sendToFav(movie)"
            src="./assets/icons8-plus.svg"
          />
          <img
            class="plus"
            *ngIf="movie.fav === true"
            (click)="this.deleteFav(movie)"
            src="./assets/checkmark.svg"
          />
          <img
            (click)="viewDetail(movie.imdb_code)"
            [src]="movie.poster"
            class="movie-img"
          />
          <div class="bottom-container">
            <div class="movie-title" [title]="movie.title">
              <span class="text">
                {{ movie.title }}
              </span>
              <img
                class="eye"
                *ngIf="movie.see"
                src="./assets/eye-green-2.svg"
              />
            </div>
            <div class="movie-info">
              <span>{{ movie.year }}</span>
              <div class="right-container">
                <span class="right-info">
                  {{ movie.runtime }}
                </span>
                <img src="./assets/star-yellow.svg" />
                <span class="right-info">
                  {{ movie.rating }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <mat-spinner class="spinner" *ngIf="this.loadingMovie"></mat-spinner>
        <div *ngIf="this.moviesList?.length === 0 && !this.loadingMovie">
          {{ 'noResult' | translate }}
        </div>
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
  ) {}

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
    this.getMovieList(this.pageNum);
  }

  sendToFav(movie: any) {
    this.movieService.addToFav(movie, this.user.id).subscribe(
      (data) => {
        this.moviesList[
          this.moviesList.findIndex((res) => res.imdb_code === movie.imdb_code)
        ].fav = true;
        this.cd.detectChanges();
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
        this.moviesList[
          this.moviesList.findIndex((res) => res.imdb_code === movie.imdb_code)
        ].fav = false;

        this.cd.detectChanges();
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

  public isImage(src) {
    var image = new Image();
    let res = src;
    image.src = src;
    image.onerror = function () {
      console.log("c'est de la merde");
    };
    // image.onload = function () {
    //   console.log("c'est de la loading");
    // };

    if (image.width === 0 && image.height === 0) {
      return './assets/eye-green.svg';
    } else {
      return src;
    }
    // const request = new XMLHttpRequest();
    // request.onload = function () {
    //   let status = request.status;
    //   if (request.status == 200) {
    //     res = src;
    //     console.log('yes');
    //   } else {
    //     console.log('merde');
    //     res = './assets/eye-green.svg';
    //   }
    // };
    // request.open('HEAD', src, false);
    // request.withCredentials = false;

    // request.send();

    return res;
  }

  getMovieList(page: number) {
    if (!this.loadingMovie) {
      this.loadingMovie = true;
      this.cd.detectChanges();
      console.log({
        userId: this.user.id,
        page: page,
        genre: this.paramsFilterSort?.genre,
        sort: 'download_count',
        note: this.paramsFilterSort?.note,
        search: this.paramsFilterSort?.name,
        order: this.paramsFilterSort?.orderBy,
      });
      this.movieService
        .getListMovies({
          userId: this.user.id,
          page: page,
          genre: this.paramsFilterSort?.genre,
          sort: this.paramsFilterSort?.sortBy,
          note: this.paramsFilterSort?.note,
          search: this.paramsFilterSort?.name,
          order: this.paramsFilterSort?.orderBy,
        })
        .subscribe(
          (data) => {
            if (!this.moviesList || this.moviesList.length === 0)
              this.moviesList = data.movies;
            else this.moviesList = this.moviesList.concat(data.movies);
            this.loadingMovie = false;
            console.log(data);
            if (this.moviesList.length < 10) {
              this.pageNum++;
              this.getMovieList(this.pageNum);
            }

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
