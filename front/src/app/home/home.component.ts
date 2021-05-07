import { MatDialog } from '@angular/material/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'libs/user';
import { AuthService } from '../_services/auth_service';
import { movieService } from '../_services/movie_service';
import { PopUpComponent } from '../pop-up/pop-up.component';
@Component({
  selector: 'app-home',
  template: `
    <div class="title-home">Les films du moment</div>
    <div class="list">
      <div *ngFor="let movie of this.moviesList" class="movie-container">
        <img
          class="plus"
          *ngIf="movie.fav === false && this.islog"
          (click)="this.sendToFav(movie)"
          src="./assets/icons8-plus.svg"
        />
        <img
          class="plus"
          *ngIf="movie.fav === true && this.islog"
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
            <img class="eye" *ngIf="movie.see" src="./assets/eye-green-2.svg" />
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
  `,
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  islog = false;
  public moviesList = [];
  public loadingMovie = false;
  public user: User;

  private secret = 'plaurent-secret-key';

  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private movieService: movieService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.checkIfUserCo().subscribe(
      (data) => {
        console.log(data);
        if (JSON.parse(data)['status'] === true) {
          this.islog = true;
          this.user = this.authService.getUser();
        } else console.log(data.message);
        this.getMovieList(1);
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getMovieList(page: number) {
    if (!this.loadingMovie) {
      this.loadingMovie = true;
      this.cd.detectChanges();
      this.movieService
        .getListMovies({
          userId: this.islog ? this.user.id : undefined,
          page: page,
        })
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

  viewDetail(imdb_code) {
    if (this.islog) {
      this.route.navigate(['/detail-movie/' + imdb_code]);
    } else {
      let dialogRef = this.dialog.open(PopUpComponent, {
        data: {
          title: 'Un instant !',
          message: 'Vous devez vous créer un compte ou vous connecter.',
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.login();
        }
      });
    }
  }

  login() {
    this.route.navigate(['/login']);
  }

  profile() {
    this.route.navigate(['/profile']);
  }
}
