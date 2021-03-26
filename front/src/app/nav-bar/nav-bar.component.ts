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

@Component({
  selector: 'nav-bar',
  template: `
    <a
      class="case"
      *ngFor="let item of this.items"
      [routerLink]="item.route"
      routerLinkActive="active"
      (click)="this.selectItem(item.id)"
    >
      <img [src]="item.selected ? item.src.check : item.src.default" />
    </a>
    <div class="case">
      <img (click)="this.logOut()" src="./assets/log-out.svg" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavigationBarComponent implements OnChanges, OnDestroy {
  @Input() public selectedId = '';
  @Input() public isLog = false;

  public items = [
    {
      id: 'profile',
      src: {
        check: './assets/user-check.svg',
        default: './assets/user.svg',
      },
      route: 'login',
      selected: false,
    },
    {
      id: 'home',
      src: {
        check: './assets/home.svg',
        default: './assets/home.svg',
      },
      route: 'home',
      selected: true,
    },
    {
      id: 'message',
      src: {
        check: './assets/message-circle-check.svg',
        default: './assets/message-circle.svg',
      },
      route: 'messaging',
      selected: false,
    },
  ];

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnChanges(): void {
    if (this.isLog) {
      this.items.forEach((item) => {
        if (item.id === 'profile') {
          item.route = 'profile';
        }
      });
    }
    if (this.selectedId) {
      this.selectItem(this.selectedId);
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
  }

  ngOnDestroy() {}
}
