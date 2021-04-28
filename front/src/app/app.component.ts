import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './_services/auth_service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterContentInit {
  title = 'front';

  public idNavBar = '';

  constructor(
    private route: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
  }

  ngAfterContentInit() {
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
