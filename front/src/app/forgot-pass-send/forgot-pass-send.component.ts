import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup } from "@angular/forms";
import { AuthService } from "../_services/auth_service";

function ValidatorEmail(control: FormControl) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(control.value).toLowerCase())) {
    return { error: "Mauvais format" };
  }
  return {};
}

@Component({
  selector: 'app-forgot-pass-send',
  template: ` <div class="no-verify-container">
    <div class="title">
      Veuillez entrer l'adresse mail de votre compte. Un email vous sera envoyé.
    </div>

    <form
      [formGroup]="this.loginForm"
      name="form"
      (ngSubmit)="f.form.valid && onSubmit()"
      #f="ngForm"
      novalidate
    >
      <div class="form-container">
        <input
          type="email"
          class="form-control"
          name="email"
          required
          email
          formControlName="email"
          placeholder="Email"
        />
        <div class="error" *ngIf="this.loginForm.get('email').errors?.error">
          {{ this.loginForm.get("email").errors.error }}
        </div>
        <button class="primary-button">Vérifier</button>
      </div>
    </form>
  </div>`,
  styleUrls: ["./forgot-pass-send.component.scss"],
})
export class ForgotPassSendComponent implements OnInit {
  public loginForm = new FormGroup({
    email: new FormControl("", ValidatorEmail),
  });

  constructor(
    private authService: AuthService,
    public route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void { }

  onSubmit() {
    this.authService.forgotPass_s(this.loginForm.getRawValue()).subscribe(
      data => {
        if (data.status == true) {
          this.router.navigate(["login"]);
        } else {
        }
      },
      err => {
        this.router.navigate(["/maintenance"]);
      }
    );
  }
}
