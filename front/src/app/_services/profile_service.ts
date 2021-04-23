import { ChangeDetectorRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { mapUserBackToUserFront, User } from 'libs/user';
import { map, tap } from 'rxjs/operators';

const AUTH_API = 'http://localhost:8080/api/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient, private route: Router) {}

  updateProfile(userId: string, user: User) {
    return this.http.post(AUTH_API + `users/${userId}`, user, httpOptions);
  }
}
