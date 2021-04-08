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
export class AuthService {
  constructor(private http: HttpClient, private route: Router) {}

  login(user: Partial<User>): Observable<any> {
    return this.http
      .post(
        AUTH_API + 'authenticate',
        {
          userName: user.userName,
          password: user.password,
        },
        httpOptions
      )
      .pipe(
        map((res: any) => {
          return { user: mapUserBackToUserFront(res), token: res.accessToken };
        })
      );
  }

  loginOauth(strategy: string): Observable<any> {
    return this.http.get(AUTH_API + `authenticate/${strategy}`, httpOptions);
  }

  logOut() {
    localStorage.clear();
    this.route.navigate(['/home']);
  }

  register(user: Partial<User>): Observable<any> {
    return this.http.post(
      AUTH_API + 'register',
      {
        userName: user.userName,
        email: user.email,
        password: user.password,
        lastName: user.lastName,
        firstName: user.firstName,
      },
      httpOptions
    );
  }

  saveToken(token: string): void {
    window.localStorage.removeItem('auth-token');
    window.localStorage.setItem('auth-token', token);
  }

  getToken(): string | null {
    return window.localStorage.getItem('auth-token');
  }

  saveUser(user: any): void {
    window.localStorage.removeItem('auth-user');
    window.localStorage.setItem('auth-user', JSON.stringify(user));
  }

  getUser(): any {
    const user = window.localStorage.getItem('auth-user');
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  checkIfUserCo(): Observable<any> {
    return this.http.get(AUTH_API + 'test/user', { responseType: 'text' });
  }
}
