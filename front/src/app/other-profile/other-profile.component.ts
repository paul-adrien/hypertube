import { FormControl, FormGroup } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'libs/user';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { AuthService } from '../_services/auth_service';
import { ProfileService } from '../_services/profile_service';
import { movieService } from '../_services/movie_service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="this.user" class="top-container">
      <div class="user-container">
        <img
          class="profile-picture"
          [src]="this.picture ? this.picture : './assets/plus.svg'"
        />
        <div *ngIf="user?.userName" class="username">{{ user.userName }}</div>
        <div class="name" *ngIf="user?.firstName && user?.lastName">
          ({{ user.firstName + ' ' + user.lastName }})
        </div>
        <div class="name">{{ user.email }}</div>
      </div>
      <div class="info-container">
        <div class="title">{{ 'info' | translate }}</div>
        <div class="form-container">
          <div *ngIf="this.user.userName" class="block">
            <div class="text">{{ 'userName' | translate }}</div>
            <div class="input-container">{{ this.user.userName }}</div>
          </div>
          <div *ngIf="this.user.firstName" class="block">
            <div class="text">{{ 'firstName' | translate }}</div>
            <div class="input-container">{{ this.user.firstName }}</div>
          </div>
          <div *ngIf="this.user.lastName" class="block">
            <div class="text">{{ 'lastName' | translate }}</div>
            <div class="input-container">{{ this.user.lastName }}</div>
          </div>
          <div *ngIf="this.user.email" class="block">
            <div class="text">Email</div>
            <div class="input-container">{{ this.user.email }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-container">
      <div class="list-container">
        <span class="title">{{ 'watchMovies' | translate }}</span>
        <div class="watch-list-container">
          <div *ngFor="let movie of this.moviesList" class="movie-container">
            <img
              src="{{ movie.poster }}"
              (click)="viewDetail(movie.imdb_code)"
              class="movie-img"
            />

            <div class="bottom-movie-container">
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
          <div *ngIf="this.moviesList.length === 0" class="no-watch-list">
            {{ 'noWatchList' | translate }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./other-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherProfileComponent implements OnInit {
  public moviesList = [];
  constructor(
    private auth_service: AuthService,
    private profile_service: ProfileService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private movieService: movieService,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  public userId: string = this.route.snapshot.params.id;
  public picture = '';
  public user: User;

  ngOnInit(): void {
    this.profile_service.getProfile(this.userId).subscribe((res) => {
      this.user = res;
      this.picture = this.user.picture;
      this.movieService.getWatch(this.user.id).subscribe(
        (data) => {
          console.log(data);
          this.moviesList = data.movies;
          this.cd.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  viewDetail(imdb_code) {
    this.router.navigate(['/detail-movie/' + imdb_code]);
  }
}
