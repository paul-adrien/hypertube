import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth_service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({ providedIn: 'root' })
export class ProfileGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthService,
    private http: HttpClient
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let res: boolean;

    return this.authenticationService
      .checkIfUserCo()
      .toPromise()
      .then(
        (data) => {
          if (JSON.parse(data)['status'] === true) {
            this.router.navigate(['home']);
            return false;
          } else {
            return true;
          }
        },
        (err) => {
          this.authenticationService.logOut();
          return false;
        }
      );
  }
}
