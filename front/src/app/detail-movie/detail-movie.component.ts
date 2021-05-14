import { User } from './../../../libs/user';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../_services/auth_service';
import { commentsService } from '../_services/comments_service';
import { movieService } from '../_services/movie_service';
import { ProfileService } from '../_services/profile_service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

function ValidatorLength(control: FormControl) {
  const test = /^(?=.{3,20}$)[a-zA-Z]+(?:[-' ][a-zA-Z]+)*$/;
  if (control.value?.length > 400) {
    return { error: '400 caractères maximum' };
  }
  return {};
}

@Component({
  selector: 'app-detail-movie',
  template: `
    <div *ngIf="this.detailMovie">
      <div class="top-container">
        <div>
          <img [src]="detailMovie.poster" class="poster" />
          <div class="primary-button" (click)="addOrRemoveFav()">
            {{
              !detailMovie.fav
                ? ('addWatchList' | translate)
                : ('removeWatchList' | translate)
            }}
          </div>
        </div>
        <div class="info-container">
          <div class="title">{{ detailMovie.title }}</div>
          <div>
            <span class="info-movie">{{ detailMovie.runtime }}</span>
            <span class="info-movie">{{
              this.genderTranslate(detailMovie.genre) | async
            }}</span>
            <span class="info-movie">{{ detailMovie.year }}</span>
          </div>

          <div *ngIf="detailMovie.cast" class="sub-title">Casting</div>
          <div *ngIf="detailMovie.cast">{{ detailMovie.cast }}</div>
          <div class="sub-title">Description</div>
          <div>{{ detailMovie.resume }}</div>
        </div>
      </div>
      <div *ngIf="!loadPlayer && !isChooseT" class="torrents-container">
        <div *ngFor="let torrent of this.hashs; let index = index">
          <div
            *ngIf="torrent !== null && torrent.source !== null"
            (click)="choiceOfTorrent(index)"
            class="torrent-button"
          >
            {{ torrent.source }} {{ torrent.quality }} seeds:
            {{ torrent.seeds }} peers: {{ torrent.peers }}
            {{ torrent.state ? 'state: ' + torrent.state : '' }}
          </div>
        </div>
      </div>
      <app-player
        *ngIf="loadPlayer"
        style="width: 100%; height: calc(100vw / 2)"
        [hash]="hashs[this.index].hash"
        [quality]="hashs[this.index].quality"
        [imdb_code]="detailMovie.imdb_code"
        [lang]="user.lang"
      ></app-player>
      <mat-spinner
        class="spinner"
        *ngIf="this.isChooseT && !loadPlayer"
      ></mat-spinner>

      <div class="title-comment">{{ 'comments' | translate }}</div>
      <div class="comment-container" *ngIf="comments !== null">
        <div *ngFor="let comment of comments" class="comment">
          <img
            class="picture-comment"
            [src]="
              this.getProfileInfo(comment.userId)?.picture
                ? this.getProfileInfo(comment.userId)?.picture
                : './assets/user.svg'
            "
            (click)="this.viewProfile(comment.userId)"
          />
          <div class="text-container">
            <div
              style="cursor: pointer"
              (click)="this.viewProfile(comment.userId)"
            >
              {{ this.getProfileInfo(comment.userId)?.userName || 'username' }}
            </div>
            <div class="text-comment">{{ comment.comment }}</div>
          </div>
        </div>
      </div>
      <form
        [formGroup]="this.commentForm"
        class="form-container"
        name="form"
        (ngSubmit)="addComment()"
        #f="ngForm"
        novalidate
      >
        <div class="input-flex">
          <input
            type="text"
            formControlName="comment"
            id="comment"
            class="input-container"
            required
            [class.error-input]="this.commentForm.get('comment').errors?.error"
            placeholder="Écrire un commentaire"
          />
          <img
            class="send"
            src="./assets/send.svg"
            (click)="f.form.valid && addComment()"
          />
        </div>
        <div
          class="error"
          *ngIf="this.commentForm.get('comment').errors?.error"
        >
          {{ this.commentForm.get('comment').errors.error }}
        </div>
      </form>
      <div class="title-comment">{{ 'similarTitles' | translate }}</div>
      <div *ngIf="this.suggestionList" class="list">
        <div *ngFor="let movie of this.suggestionList" class="movie-container">
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
      </div>
      <mat-spinner class="spinner" *ngIf="!this.suggestionList"></mat-spinner>
    </div>
    <mat-spinner class="spinner" *ngIf="!this.detailMovie"></mat-spinner>
  `,
  styleUrls: ['./detail-movie.component.scss'],
})
export class DetailMovieComponent implements OnInit {
  imdb_code = '';
  index = 0;
  private user: User;
  public comments = null;
  public commentForm = new FormGroup({
    comment: new FormControl('', ValidatorLength),
  });
  public loadPlayer = false;
  public hashs = null;
  public detailMovie = null;
  public isChooseT = false;
  public suggestionList = null;
  public usersComment: User[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    public route: ActivatedRoute,
    public router: Router,

    private auth_service: AuthService,
    private commentsService: commentsService,
    private movieService: movieService,
    private profileService: ProfileService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.imdb_code = this.route.snapshot.params['imdb_code'];
    // this.getMovieDetail(this.imdb_code);
    this.user = this.auth_service.getUser();
    this.getDetailMovie();
  }

  // async getMovieDetail(imdb_code: string) {
  //   this.detailMovie = await this.YTSServices.detailYTSMovies(imdb_code);
  //   this.loadPlayer = true;
  //   this.getComments();
  //   this.cd.detectChanges();
  // }

  async getDetailMovie() {
    this.movieService.getDetailMovie(this.imdb_code, this.user.id).subscribe(
      (data) => {
        this.detailMovie = data.movieDetail;
        this.hashs = data.hashs.filter(
          (torrent) => torrent !== null && torrent.source !== null
        );
        this.getComments();
        this.getSuggestionMovieList(1);
        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  addOrRemoveFav() {
    if (!this.detailMovie.fav) {
      this.movieService.addToFav(this.detailMovie, this.user.id).subscribe(
        (data) => {
          this.detailMovie.fav = true;
          this.cd.detectChanges();
        },
        (err) => {}
      );
    } else {
      this.movieService.deleteFav(this.detailMovie, this.user.id).subscribe(
        (data) => {
          this.detailMovie.fav = false;
          this.cd.detectChanges();
        },
        (err) => {}
      );
    }
  }

  sendToFav(movie: any) {
    this.movieService.addToFav(movie, this.user.id).subscribe(
      (data) => {
        this.suggestionList[
          this.suggestionList.findIndex(
            (res) => res.imdb_code === movie.imdb_code
          )
        ].fav = true;
        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  deleteFav(movie: any) {
    this.movieService.deleteFav(movie, this.user.id).subscribe(
      (data) => {
        this.suggestionList[
          this.suggestionList.findIndex(
            (res) => res.imdb_code === movie.imdb_code
          )
        ].fav = false;

        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  async choiceOfTorrent(index) {
    this.isChooseT = true;
    this.cd.detectChanges();
    this.index = index;
    if (this.hashs[index].state !== 'over') {
      let result = await this.movieService.download(
        this.hashs[index].hash,
        this.detailMovie.imdb_code,
        this.hashs[index].size,
        this.hashs[index].quality,
        this.user.id
      );
    }
    this.loadPlayer = true;
    this.cd.detectChanges();
  }

  getComments() {
    this.commentsService.getComments(this.detailMovie.imdb_code).subscribe(
      (data) => {
        if (data.status) {
          this.comments = data.comments;
          this.comments.forEach((comment) => {
            this.profileService.getProfile(comment.userId).subscribe((res) => {
              if (!this.usersComment.find((user) => res.id === user.id)) {
                this.usersComment.push(res);
              }
            });
          });
        } else this.comments = null;
        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  addComment() {
    const form = this.commentForm.getRawValue();
    if (form.comment.length > 0) {
      this.commentsService
        .addComment(form, this.detailMovie.imdb_code, this.user.id)
        .subscribe(
          (data) => {
            this.commentForm.get('comment').setValue('');
            this.getComments();
          },
          (err) => {}
        );
      this.getComments();
      this.cd.detectChanges();
    }
  }

  getSuggestionMovieList(page: number) {
    let genre = this.detailMovie.genre.split(',');
    this.movieService
      .getListMovies({
        userId: this.user.id,
        page: page,
        genre: genre[0],
        sort: 'download_count',
        note: null,
        search: null,
        order: null,
      })
      .subscribe(
        (data) => {
          if (!data?.movies) {
            this.getSuggestionMovieList(page + 1);
          } else {
            this.suggestionList = data.movies.filter(
              (movie) => this.detailMovie.imdb_code !== movie.imdb_code
            );
          }
          this.cd.detectChanges();
        },
        (err) => {}
      );
  }

  getProfileInfo(userId: string) {
    if (this.user.id === userId) {
      return this.user;
    }
    return this.usersComment.find((user) => user.id === userId);
  }

  public viewProfile(userId: string) {
    if (this.user.id === userId) {
      this.router.navigate([`/profile`]);
    } else {
      this.router.navigate([`/profile/${userId}`]);
    }
  }

  public genderTranslate(genders: string) {
    return this.translate
      .get(genders.split(', '))
      .pipe(map((genders) => Object.values(genders).join(', ')));
  }

  viewDetail(imdb_code) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/detail-movie/' + imdb_code]);
    });
    this.cd.detectChanges();
  }
}
