import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth_service';

@Component({
  selector: 'app-home',
  template: `
    <p>home works!</p>
    <button *ngIf="islog === false" (click)="login()">Login/register</button>
    <button *ngIf="islog === true" (click)="profile()">Profile</button>
  `,
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  islog = false;

  constructor(
    private route: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.checkIfUserCo().subscribe(
      (data) => {
        if (JSON.parse(data)['status'] === true) this.islog = true;
        else console.log(data.message);
        this.cd.detectChanges();
      },
      (err) => {}
    );
  }

  login() {
    this.route.navigate(['/login']);
  }

  profile() {
    this.route.navigate(['/profile']);
  }
}
