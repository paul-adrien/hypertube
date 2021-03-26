import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './_services/auth_service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'front';

  public idNavBar = '';

  constructor(
    private route: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (
      this.route.url.includes('profile') &&
      !this.route.url.includes('profile-')
    ) {
      this.idNavBar = 'profile';
    } else if (
      this.route.url.includes('messaging') ||
      this.route.url.includes('discussion/')
    ) {
      this.idNavBar = 'message';
    } else if (this.route.url.includes('home')) {
      this.idNavBar = 'home';
    }
  }
}
