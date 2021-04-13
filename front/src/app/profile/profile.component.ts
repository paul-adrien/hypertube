import { Component, OnInit } from '@angular/core';
import { User } from 'libs/user';
import { AuthService } from '../_services/auth_service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="user-container">
      <img
        class="profile-picture"
        [src]="user.picture ? user.picture : './assets/plus.svg'"
      />
      <div class="username">{{ user.userName }}</div>
      <div class="name">({{ user.firstName + ' ' + user.lastName }})</div>
      <div class="name">{{ user.email }}</div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public user: User;
  constructor(private auth_service: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
  }
}
