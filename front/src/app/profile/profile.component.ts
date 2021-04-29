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
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
        <div class="name">({{ user.firstName + ' ' + user.lastName }})</div>
        <div class="name">{{ user.email }}</div>
      </div>
      <div class="info-container">
        <div class="title">Informations</div>
        <form
          class="form-container"
          [formGroup]="this.userForm"
          (ngSubmit)="f.form.valid && onSubmit()"
          #f="ngForm"
          novalidate
        >
          <div class="block">
            <div class="text">Nom d'utilisateur</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="userName"
                required
                placeholder="Nom d'utilisateur"
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
            <div class="text">Prénom</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="firstName"
                required
                placeholder="Prénom"
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
            <div class="text">Nom</div>
            <div class="input-container">
              <input
                class="input"
                formControlName="lastName"
                required
                placeholder="Nom"
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
          <button (ngSubmit)="this.onSubmit()" class="primary-button">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
    <div class="list" *ngIf="moviesList">
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
      </div>
  `,
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  public user: User;
  public moviesList = [];
  constructor(
    private auth_service: AuthService,
    private profile_service: ProfileService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private movieService: movieService
  ) { }

  public userForm = new FormGroup({
    userName: new FormControl('', ValidatorUserNameLength),
    firstName: new FormControl('', ValidatorLength),
    lastName: new FormControl('', ValidatorLength),
    email: new FormControl('', ValidatorEmail),
    picture: new FormControl(''),
  });

  public picture = '';

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
    this.userForm.patchValue(this.user);
    this.picture = this.user.picture;
    this.movieService.getFav(this.user.id).subscribe(
      (data) => {
        console.log(data);
        this.moviesList = data.movies;
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
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

        img.onload = () => {
          const height = img.naturalHeight;
          const width = img.naturalWidth;
          this.cd.detectChanges();
        };
        if ((reader.result as string).length > 5) {
          this.picture = reader.result as string;
          this.userForm.get('picture').patchValue(reader.result as string);
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
    console.log(this.userForm.getRawValue());
    this.profile_service
      .updateProfile(this.user.id, this.userForm.getRawValue())
      .subscribe();
  }
}
