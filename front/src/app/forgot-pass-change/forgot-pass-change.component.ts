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

function ValidatorPass(control: FormControl) {
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!re.test(String(control.value).toLowerCase())) {
    return {
      error:
        "le mot de passe doit comporter minimum 8 caractères, un chiffre et un caractère spéciale",
    };
  }
  return {};
}

@Component({
  selector: "app-forgot-pass-change",
  template: `<div class="no-verify-container">
    <div class="title">
      Veuillez entrer l'adresse mail de votre compte et votre nouveau mot de passe.
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
          formControlName="email"
          required
          email
          placeholder="Email"
        />
        <div class="error" *ngIf="this.loginForm.get('email').errors?.error">
          {{ this.loginForm.get("email").errors.error }}
        </div>
        <input
          type="password"
          class="form-control"
          name="password"
          formControlName="password"
          required
          minlength="6"
          placeholder="Password"
        />
        <div class="error" *ngIf="this.loginForm.get('password').errors?.error">
          {{ this.loginForm.get("password").errors.error }}
        </div>
        <button class="primary-button">Vérifier</button>
      </div>
    </form>
  </div> `,
  styleUrls: ["./forgot-pass-change.component.scss"],
})
export class ForgotPassChangeComponent implements OnInit {
  id = 0;

  public loginForm = new FormGroup({
    email: new FormControl("", ValidatorEmail),
    password: new FormControl("", ValidatorPass),
  });

  constructor(
    private authService: AuthService,
    public route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params["id"];
  }

  onSubmit() {
    this.authService.forgotPass_c(this.loginForm.getRawValue(), this.id).subscribe(
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
