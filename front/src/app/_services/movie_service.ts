import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import axios from 'axios';
import { AuthService } from './auth_service';
export var searchCancelTokenFetch = { id: null, source: null };

const AUTH_API = 'http://localhost:8080/api/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class movieService {
  constructor(
    private http: HttpClient,
    private route: Router,
    private authService: AuthService
  ) {}

  // watchMovie(imdb_id: string, hash: string): Observable<any> {
  //     console.log(AUTH_API + `movie/watch/${imdb_id}?hash=${hash}`);
  //     return this.http.get(AUTH_API + `movie/watch/${imdb_id}?hash=${hash}`);
  // }

  getSubtitles(imdb_id: string): Observable<any> {
    return this.http.get(AUTH_API + `movie/subtitles/${imdb_id}`);
  }

  getListMovies(params: {
    userId: string;
    page: number;
    genre: string;
    sort: string;
    note?: number;
    search?: string;
    order?: string;
  }): Observable<any> {
    if (
      params.genre === 'Tout' ||
      params.genre === undefined ||
      params.genre === 'Genre'
    ) {
      params.genre = 'all';
    }
    if (!params.note || (params.note as any) === 'Note') {
      params.note = 0;
    }
    if (!params.search) {
      params.search = '';
    }
    if (!params.sort || params.sort === 'Trier par') {
      params.sort = 'download_count';
    }
    if (!params.order || params.order === 'Ordre') {
      params.order = '';
    }
    return this.http.post(AUTH_API + 'movie/list', params, httpOptions);
  }

  getDetailMovie(imdb_id: string, userId: string): Observable<any> {
    let params = new HttpParams().set('userId', userId);
    return this.http.get(AUTH_API + `movie/detail/${imdb_id}`, {
      ...httpOptions,
      params,
    });
  }

  download(hash, imdb_id, size, quality, userId: string) {
    let token = this.authService.getToken();
    let uri = AUTH_API + `movie/download?token=${token}`;
    return new Promise((resolve, reject) => {
      axios
        .post(uri, {
          hash: hash,
          movieId: imdb_id,
          size: size,
          quality: quality,
          userId: userId,
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.error(err);
          reject({ error: err });
        });
    });
  }

  addToFav(movie: any, userId: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'movie/addToFav',
      {
        movie: movie,
        userId: userId,
      },
      httpOptions
    );
  }

  deleteFav(movie: any, userId: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'movie/deleteFav',
      {
        movie: movie,
        userId: userId,
      },
      httpOptions
    );
  }

  getFav(userId: string): Observable<any> {
    return this.http.get(AUTH_API + `movie/getFav/${userId}`, {
      ...httpOptions,
    });
  }
}
