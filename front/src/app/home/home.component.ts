import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

  private secret = 'plaurent-secret-key';

  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      if (params.data) {
        console.log(params.data);

        const data = JSON.parse(decodeURI(params.data));
        console.log(data);
        this.authService.saveToken(data.token);
        this.authService.saveUser(data.user);
      }
    });
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
