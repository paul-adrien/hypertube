import { FormControl, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'libs/user';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { AuthService } from '../_services/auth_service';

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
          (ngSubmit)="(f.form.valid)"
          #f="ngForm"
          novalidate
        >
          <div class="block">
            <div class="text">Nom d'utilisateur</div>
            <input
              class="input"
              formControlName="userName"
              required
              placeholder="Nom d'utilisateur"
            />
          </div>
          <div class="block">
            <div class="text">Prénom</div>
            <input
              class="input"
              formControlName="firstName"
              required
              placeholder="Prénom"
            />
          </div>
          <div class="block">
            <div class="text">Nom</div>
            <input
              class="input"
              formControlName="lastName"
              required
              placeholder="Nom"
            />
          </div>
          <div class="block">
            <div class="text">Email</div>
            <input
              class="input"
              formControlName="email"
              required
              placeholder="Email"
            />
          </div>
          <button class="primary-button">Enregistrer</button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public user: User;
  constructor(
    private auth_service: AuthService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  public userForm = new FormGroup({
    userName: new FormControl('', ValidatorUserNameLength),
    firstName: new FormControl('', ValidatorLength),
    lastName: new FormControl('', ValidatorLength),
    email: new FormControl('', ValidatorEmail),
  });

  public picture = '';

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
    this.picture = this.user.picture;
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
}
