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
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

function ValidatorUserNameLength(control: FormControl) {
  const test = /^(?=.{3,20}$)[a-zA-Z0-9]+(?:[-' ][a-zA-Z0-9]+)*$/;
  if (control.value?.length < 3) {
    return { error: '3 caractères minimum' };
  } else if (control.value?.length > 20) {
    return { error: '20 caractères maximum' };
  } else if (!test.test(String(control.value).toLowerCase())) {
    return { error: 'Mauvais format' };
  }
}

function ValidatorLength(control: FormControl) {
  const test = /^(?=.{3,20}$)[a-zA-Z]+(?:[-' ][a-zA-Z]+)*$/;
  if (control.value?.length < 3) {
    return { error: '3 caractères minimum' };
  } else if (control.value?.length > 20) {
    return { error: '20 caractères maximum' };
  } else if (!test.test(String(control.value).toLowerCase())) {
    return { error: 'Mauvais format' };
  }
}

function ValidatorEmail(control: FormControl) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(control.value).toLowerCase())) {
    return { error: 'Mauvais format' };
  }
}
@Component({
  selector: 'app-profile',
  template: `
    <div class="top-container">
      <div class="user-container">
        <label>
          <input
            id="fileInput"
            class="input-file"
            accept="image/jpeg, image/png"
            type="file"
            (change)="this.fileChangeEvent($event)"
          />
          <img
            class="profile-picture"
            [src]="this.picture ? this.picture : './assets/plus.svg'"
          />
        </label>
        <div class="username">{{ user.userName }}</div>
        <div class="name" *ngIf="user.firstName && user.lastName">
          ({{ user.firstName + ' ' + user.lastName }})
        </div>
        <div class="name">{{ user.email }}</div>
      </div>
      <div class="info-container">
        <div class="title">{{ 'info' | translate }}</div>
        <form
          class="form-container"
          [formGroup]="this.userForm"
          (ngSubmit)="f.form.valid && onSubmit()"
          #f="ngForm"
          novalidate
        >
          <div class="block">
            <div class="text">{{ 'userName' | translate }}</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="userName"
                required
                placeholder="{{ 'userName' | translate }}"
              />
              <div
                class="error"
                *ngIf="this.userForm.get('userName').errors?.error"
              >
                {{ this.userForm.get('userName').errors.error }}
              </div>
            </div>
          </div>
          <div class="block">
            <div class="text">{{ 'firstName' | translate }}</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="firstName"
                required
                placeholder="{{ 'firstName' | translate }}"
              />
              <div
                class="error"
                *ngIf="this.userForm.get('firstName').errors?.error"
              >
                {{ this.userForm.get('firstName').errors.error }}
              </div>
            </div>
          </div>
          <div class="block">
            <div class="text">{{ 'lastName' | translate }}</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="lastName"
                required
                placeholder="{{ 'lastName' | translate }}"
              />
              <div
                class="error"
                *ngIf="this.userForm.get('lastName').errors?.error"
              >
                {{ this.userForm.get('lastName').errors.error }}
              </div>
            </div>
          </div>
          <div class="block">
            <div class="text">Email</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="email"
                required
                placeholder="Email"
              />
              <div
                class="error"
                *ngIf="this.userForm.get('email').errors?.error"
              >
                {{ this.userForm.get('email').errors.error }}
              </div>
            </div>
          </div>
          <div class="block">
            <div class="text">{{ 'language' | translate }}</div>
            <div class="input-container">
              <select class="input" #selectedLang formControlName="lang">
                <option
                  *ngFor="let language of translate.getLangs()"
                  [value]="language"
                >
                  {{ language }}
                </option>
              </select>
              <div
                class="error"
                *ngIf="this.userForm.get('email').errors?.error"
              >
                {{ this.userForm.get('email').errors.error }}
              </div>
            </div>
          </div>
          <button (ngSubmit)="this.onSubmit()" class="primary-button">
            {{ 'update' | translate }}
          </button>
        </form>
      </div>
    </div>
    <div class="bottom-container">
      <div class="list-container">
        <span class="title">{{ 'watchList' | translate }}</span>
        <div class="watch-list-container">
          <div *ngFor="let movie of this.moviesFavList" class="movie-container">
            <img
              src="{{ movie.poster }}"
              (click)="viewDetail(movie.imdb_code)"
              class="movie-img"
            />
            <img
              class="plus"
              (click)="this.deleteFav(movie)"
              src="./assets/red-x.svg"
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
          <div *ngIf="this.moviesFavList.length === 0" class="no-watch-list">
            {{ 'noWatchList' | translate }}
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-container">
      <div class="list-container">
        <span class="title">{{ 'watchMovies' | translate }}</span>
        <div class="watch-list-container">
          <div
            *ngFor="let movie of this.moviesWatchList"
            class="movie-container"
          >
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
          <div *ngIf="this.moviesWatchList?.length === 0" class="no-watch-list">
            {{ 'noWatchMovie' | translate }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  public user: User;
  public moviesFavList = [];
  public moviesWatchList = [];

  constructor(
    private auth_service: AuthService,
    private profile_service: ProfileService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private movieService: movieService,
    private route: Router,
    public translate: TranslateService
  ) {}

  public userForm = new FormGroup({
    userName: new FormControl('', ValidatorUserNameLength),
    firstName: new FormControl('', ValidatorLength),
    lastName: new FormControl('', ValidatorLength),
    email: new FormControl('', ValidatorEmail),
    picture: new FormControl(''),
    lang: new FormControl(''),
  });

  public picture = '';

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
    this.userForm.patchValue(this.user);
    this.picture = this.user.picture;
    this.movieService.getFav(this.user.id).subscribe(
      (data) => {
        this.moviesFavList = data.movies;
        this.cd.detectChanges();
      },
      (err) => {}
    );
    this.movieService.getWatch(this.user.id).subscribe(
      (data) => {
        if (data?.movies) {
          this.moviesWatchList = data.movies;
        }
        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  public fileChangeEvent(event: any): void {
    this.validateAndUpload(event);
  }

  public validateAndUpload(event) {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (file) {
        const img = new Image();

        img.onerror = () => {
          let dialogRef = this.dialog.open(PopUpComponent, {
            data: {
              title: 'Attention',
              message:
                "Votre photo n'est pas valide, veuillez essayer avec une autre photo.",
            },
          });
        };
        img.onload = () => {
          const height = img.naturalHeight;
          const width = img.naturalWidth;
          if (height && width) {
            this.picture = reader.result as string;
            this.userForm.get('picture').patchValue(reader.result as string);
          } else {
            let dialogRef = this.dialog.open(PopUpComponent, {
              data: {
                title: 'Attention',
                message:
                  "Votre photo n'est pas valide, veuillez essayer avec une autre photo.",
              },
            });
          }
          this.cd.detectChanges();
        };
        if ((reader.result as string).length > 5) {
          img.src = reader.result as string;
        } else {
          let dialogRef = this.dialog.open(PopUpComponent, {
            data: {
              title: 'Attention',
              message:
                "Votre photo n'est pas valide, veuillez essayer avec une autre photo.",
            },
          });
        }
      }
    };
  }

  public onSubmit() {
    this.profile_service
      .updateProfile(this.user.id, this.userForm.getRawValue())
      .subscribe((data) => {
        this.auth_service.saveUser(data);
        this.switchLang((data as any).lang);
      });
  }

  viewDetail(imdb_code) {
    this.route.navigate(['/detail-movie/' + imdb_code]);
  }

  deleteFav(movie: any) {
    this.movieService.deleteFav(movie, this.user.id).subscribe(
      (data) => {
        this.moviesFavList = this.moviesFavList.filter(
          (res) => res.imdb_code !== movie.imdb_code
        );

        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    const currentRoute = this.route.url;

    if (currentRoute === '/home') {
      this.route
        .navigateByUrl('/list-Movies', { skipLocationChange: true })
        .then(() => {
          this.route.navigate([currentRoute]); // navigate to same route
        });
    } else {
      this.route.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.route.navigate([currentRoute]); // navigate to same route
      });
    }
  }
}
