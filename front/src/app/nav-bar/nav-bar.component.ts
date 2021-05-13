import { AuthService } from './../_services/auth_service';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'nav-bar',
  template: `
    <img class="logo" [routerLink]="'home'" src="./assets/logo.png" />
    <div class="left-case">
      <div class="left-case" *ngIf="this.islog">
        <a
          class="case"
          *ngFor="let item of this.items"
          [routerLink]="item.route"
          routerLinkActive="active"
          (click)="this.selectItem(item.id)"
        >
          <img
            *ngIf="item.id !== 'profile'"
            [src]="item.selected ? item.src.check : item.src.default"
          />
          <img
            *ngIf="item.id === 'profile'"
            class="picture"
            [class.checked]="item.selected"
            [src]="this.profilPicture"
          />
        </a>
      </div>
      <a
        *ngIf="!this.islog"
        class="case"
        [routerLink]="'home'"
        routerLinkActive="active"
        (click)="this.selectItem('home')"
      >
        <img
          [src]="items[1].selected ? items[1].src.check : items[1].src.default"
      /></a>
      <div
        *ngIf="!this.islog"
        class="login"
        [routerLink]="'login'"
        routerLinkActive="active"
      >
        Log in
      </div>
      <div class="case" *ngIf="this.islog">
        <img (click)="this.logOut()" src="./assets/log-out.svg" />
      </div>
      <select
        class="login"
        #selectedLang
        (change)="switchLang(selectedLang.value)"
      >
        <option selected disabled hidden>{{ translate.defaultLang }}</option>
        <option
          *ngFor="let language of translate.getLangs()"
          [value]="language"
          [selected]="language === translate.currentLang"
        >
          {{ language }}
        </option>
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavigationBarComponent implements OnInit, OnDestroy {
  @Input() public selectedId = '';

  public items = [
    {
      id: 'profile',
      src: {
        check: './assets/user-check.svg',
        default: './assets/user.svg',
      },
      route: 'profile',
      selected: false,
    },
    {
      id: 'home',
      src: {
        check: './assets/home-check.svg',
        default: './assets/home.svg',
      },
      route: 'home',
      selected: true,
    },
    {
      id: 'list-Movies',
      src: {
        check: './assets/film-check.svg',
        default: './assets/film.svg',
      },
      route: 'list-Movies',
      selected: false,
    },
  ];

  public islog = false;

  public profilPicture = '';

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.checkIfUserCo().subscribe(
      (data) => {
        console.log(data);
        if (JSON.parse(data)['status'] === true) {
          this.islog = true;
        } else console.log(data.message);
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
    if (this.selectedId) {
      this.selectItem(this.selectedId);
    }
    this.profilPicture = JSON.parse(localStorage.getItem('auth-user'))?.picture;
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.profilPicture = JSON.parse(localStorage.getItem('auth-user'))?.picture;
    this.cd.detectChanges();
  }

  ngAfterViewChecked() {
    const user = this.authService.getUser();

    if (user) {
      this.islog = true;
    } else {
      this.islog = false;
    }

    if (
      this.router.url.includes('profile') &&
      !this.router.url.includes('profile/')
    ) {
      this.selectItem('profile');
    } else if (
      this.router.url.includes('list-Movies') ||
      this.router.url.includes('detail-movie')
    ) {
      this.selectItem('list-Movies');
    } else if (this.router.url.includes('home')) {
      this.selectItem('home');
    } else if (this.router.url.includes('login')) {
      this.selectItem('');
      this.islog = false;
    }

    if (!this.profilPicture) {
      this.profilPicture = JSON.parse(
        localStorage.getItem('auth-user')
      )?.picture;
    }
    this.cd.detectChanges();
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    const currentRoute = this.router.url;

    if (currentRoute === '/home') {
      this.router
        .navigateByUrl('/list-Movies', { skipLocationChange: true })
        .then(() => {
          this.router.navigate([currentRoute]); // navigate to same route
        });
    } else {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentRoute]); // navigate to same route
      });
    }
  }

  public selectItem(id: string) {
    this.items.forEach((item) => {
      if (item.id === id) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    this.cd.detectChanges();
  }

  public logOut() {
    this.authService.logOut();
    this.selectItem('home');
  }

  ngOnDestroy() {}
}
