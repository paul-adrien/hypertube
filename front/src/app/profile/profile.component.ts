import { Component, OnInit } from '@angular/core';
import { User } from 'libs/user';
import { AuthService } from '../_services/auth_service';

@Component({
  selector: 'app-profile',
  template: `
    <p>Profil:</p>
    <p>{{user.firstName}}</p>
    <p>{{user.lastName}}</p>
    <p>{{user.email}}</p>
  `,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public user: User;
  constructor(private auth_service: AuthService) { }

  ngOnInit(): void {
    this.user = this.auth_service.getUser();
  }

}
