import { User } from './../../../libs/user';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../_services/auth_service';
import { commentsService } from '../_services/comments_service';
import { movieService } from '../_services/movie_service';
import { ProfileService } from '../_services/profile_service';

function ValidatorLength(control: FormControl) {
  const test = /^(?=.{3,20}$)[a-zA-Z]+(?:[-' ][a-zA-Z]+)*$/;
  if (control.value?.length < 1) {
    return { error: '1 caractères minimum' };
  } else if (control.value?.length > 400) {
    return { error: '400 caractères maximum' };
  } else if (!test.test(String(control.value).toLowerCase())) {
    return { error: 'Mauvais format' };
  }
  return {};
}

@Component({
  selector: 'app-detail-movie',
  template: `
    <div *ngIf="detailMovie" class="top-container">
      <img [src]="detailMovie.poster" class="poster" />
      <div class="info-container">
        <div class="title">{{ detailMovie.title }}</div>
        <div>
          <span class="info-movie">{{ detailMovie.runtime }}</span>
          <span class="info-movie">{{ detailMovie.genre }}</span>
          <span class="info-movie">{{ detailMovie.year }}</span>
        </div>

        <div class="sub-title">Description</div>
        <div>{{ detailMovie.resume }}</div>
      </div>
    </div>
    <div *ngIf="!loadPlayer && !isChooseT" class="torrents-container">
      <div
        *ngFor="let torrent of this.hashs; let index = index">
        <div *ngIf='torrent !== null && torrent.source !== null'
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
    ></app-player>

    <div class="comment" *ngIf="comments !== null">
      <div *ngFor="let comment of comments">
        <p>{{ comment[this.user.id] }} le {{ comment['date'] }}:</p>
        <p>{{ comment['comment'] }}<button (click)="getProfile(comment['username'])">Voir le profile</button></p>
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
      <input
        type="text"
        formControlName="comment"
        id="comment"
        required
        [class.error-input]="this.commentForm.get('comment').errors?.error"
        placeholder="Nom d'utilisateur"
      />
      <div class="error" *ngIf="this.commentForm.get('comment').errors?.error">
        {{ this.commentForm.get('comment').errors.error }}
      </div>
      <button>envoyer</button>
    </form>

    <div class="list">
        <div *ngFor="let movie of this.suggestionList" class="movie-container">
          <div *ngIf="detailMovie.imdb_code !== movie.imdb_code">
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

  constructor(
    private cd: ChangeDetectorRef,
    public route: ActivatedRoute,
    private auth_service: AuthService,
    private commentsService: commentsService,
    private movieService: movieService,
    private profileService: ProfileService
  ) { }

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
        this.hashs = data.hashs;
        console.log(data);
        this.getComments();
        this.getSuggestionMovieList();
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  sendToFav(movie: any) {
    this.movieService.addToFav(movie, this.user.id).subscribe(
      (data) => {
        this.suggestionList[
          this.suggestionList.findIndex((res) => res.imdb_code === movie.imdb_code)
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
        this.suggestionList[
          this.suggestionList.findIndex((res) => res.imdb_code === movie.imdb_code)
        ].fav = false;

        this.cd.detectChanges();
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }


  async getProfile(userId: string) {
    this.profileService.getProfile(userId).subscribe(
      (data) => {
        console.log(data)
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async choiceOfTorrent(index) {
    this.isChooseT = true;
    this.cd.detectChanges();
    this.index = index;
    console.log(index);
    let result = await this.movieService.download(
      this.hashs[index].hash,
      this.detailMovie.imdb_code,
      this.hashs[index].size,
      this.hashs[index].quality,
      this.user.id
    );
    console.log(result);
    this.loadPlayer = true;
    this.cd.detectChanges();
  }

  getComments() {
    this.commentsService.getComments(this.detailMovie.imdb_code).subscribe(
      (data) => {
        if (data.status) {
          this.comments = data.comments;
        } else this.comments = null;
        console.log(data);
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  addComment() {
    const form: Partial<Comment> = this.commentForm.getRawValue();
    console.log(form, this.detailMovie.imdb_code, this.user.id);
    this.commentsService
      .addComment(form, this.detailMovie.imdb_code, this.user.id)
      .subscribe(
        (data) => {
          if (data.status) console.log(data.message);
          else console.log(data.message);
        },
        (err) => {
          console.log('non');
        }
      );
    this.getComments();
    this.cd.detectChanges();
  }

  getSuggestionMovieList() {
    let genre = this.detailMovie.genre.split(',');
    console.log(genre);
    this.movieService
      .getListMovies({
        userId: this.user.id,
        page: 1,
        genre: genre[0],
        sort: 'download_count',
        note: null,
        search: null,
        order: null,
      })
      .subscribe(
        (data) => {
          console.log(data.movies);
          this.suggestionList = data.movies;
          this.cd.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
