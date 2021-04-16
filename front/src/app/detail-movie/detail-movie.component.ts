import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../_services/auth_service';
import { YTSService } from '../_services/yts_service';
import { commentsService } from '../_services/comments_service';
import { movieService } from '../_services/movie_service';

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
    <app-player
      *ngIf="loadPlayer"
      style="width: 100%; height: 400px"
      [hash]="hashs[0]['hash']"
      [imdb_code]="detailMovie.imdb_code"
    ></app-player>

    <div class="body" *ngIf="detailMovie">
      <img src="{{ detailMovie.poster }}" style="height: 30%" />
      <p>{{ detailMovie.title }}</p>
      <div class="comment" *ngIf="comments !== null">
        <div *ngFor="let comment of comments">
          <p>{{ comment['username'] }} le {{ comment['date'] }}:</p>
          <p>{{ comment['comment'] }}</p>
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
        <div
          class="error"
          *ngIf="this.commentForm.get('comment').errors?.error"
        >
          {{ this.commentForm.get('comment').errors.error }}
        </div>
        <button>envoyer</button>
      </form>
    </div>
  `,
  styleUrls: ['./detail-movie.component.scss'],
})
export class DetailMovieComponent implements OnInit {
  imdb_code = '';
  private username = '';
  public comments = null;
  public commentForm = new FormGroup({
    comment: new FormControl('', ValidatorLength),
  });
  public loadPlayer = false;
  public hashs = null;
  public detailMovie = null;

  constructor(
    private YTSServices: YTSService,
    private cd: ChangeDetectorRef,
    public route: ActivatedRoute,
    private auth_service: AuthService,
    private commentsService: commentsService,
    private movieService: movieService
  ) { }

  ngOnInit(): void {
    this.imdb_code = this.route.snapshot.params['imdb_code'];
    // this.getMovieDetail(this.imdb_code);
    this.username = this.auth_service.getUser().userName;
    this.getDetailMovie();
  }

  // async getMovieDetail(imdb_code: string) {
  //   this.detailMovie = await this.YTSServices.detailYTSMovies(imdb_code);
  //   this.loadPlayer = true;
  //   this.getComments();
  //   this.cd.detectChanges();
  // }

  async getDetailMovie() {
    this.movieService.getDetailMovie(this.imdb_code).subscribe(
      (data) => {
        this.detailMovie = data.movieDetail;
        this.hashs = data.hashs;
        console.log(data);
        this.loadPlayer = true;
        this.getComments();
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getComments() {
    this.commentsService.getComments(this.detailMovie.imdb_code).subscribe(
      (data) => {
        if (data.status) {
          this.comments = data.comments;
        } else this.comments = null;
        console.log(this.comments);
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  addComment() {
    const form: Partial<Comment> = this.commentForm.getRawValue();
    console.log(form, this.detailMovie.imdb_code, this.username);
    this.commentsService
      .addComment(form, this.detailMovie.imdb_code, this.username)
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
}
