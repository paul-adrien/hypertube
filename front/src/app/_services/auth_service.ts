import { ChangeDetectorRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { mapUserBackToUserFront, User } from 'libs/user';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
        environment.AUTH_API + 'user/authenticate',
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
    return this.http.get(
      environment.AUTH_API + `user/authenticate/${strategy}`,
      httpOptions
    );
  }

  logOut() {
    localStorage.clear();
    this.route.navigate(['/login']);
  }

  register(user: Partial<User>): Observable<any> {
    return this.http
      .post(
        environment.AUTH_API + 'user/register',
        {
          userName: user.userName,
          email: user.email,
          password: user.password,
          lastName: user.lastName,
          firstName: user.firstName,
        },
        httpOptions
      )
      .pipe(
        map((res: any) => {
          return { user: mapUserBackToUserFront(res), token: res.accessToken };
        })
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

    return undefined;
  }

  checkIfUserCo(): Observable<any> {
    return this.http.get(environment.AUTH_API + 'token', {
      responseType: 'text',
    });
  }

  forgotPass_s(user): Observable<any> {
    return this.http.post(
      environment.AUTH_API + 'user/forgotPass',
      {
        email: user.email,
      },
      httpOptions
    );
  }

  forgotPass_c(user, id): Observable<any> {
    return this.http.put(
      environment.AUTH_API + 'user/changePass',
      {
        email: user.email,
        password: user.password,
        id: id,
      },
      httpOptions
    );
  }
}
