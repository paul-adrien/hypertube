import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import axios from 'axios';
import { AuthService } from './auth_service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
export var searchCancelTokenFetch = { id: null, source: null };

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
    private authService: AuthService,
    public translate: TranslateService
  ) { }

  getSubtitles(imdb_id: string): Observable<any> {
    return this.http.post(
      environment.AUTH_API + `movie/${imdb_id}/subtitles`,
      {},
      httpOptions
    );
  }

  getListMovies(params: {
    userId: string;
    page: number;
    genre?: string;
    sort?: string;
    note?: number;
    search?: string;
    order?: string;
  }): Observable<any> {
    if (
      params.genre === 'all' ||
      params.genre === undefined ||
      params.genre === 'gender'
    ) {
      params.genre = 'all';
    }
    if (!params.note || (params.note as any) === 'score') {
      params.note = 0;
    }
    if (!params.search) {
      params.search = '';
    }
    if (!params.sort || params.sort === 'sortBy') {
      params.sort = 'download_count';
    }
    if (!params.order || params.order === 'orderBy') {
      params.order = 'title';
    }
    let paramsLang = new HttpParams().set(
      'lang',
      this.translate.getDefaultLang()
    );

    return this.http.get(
      environment.AUTH_API +
      `movie/list?page=${params.page}
      &userId=${params.userId}
      &genre=${params.genre}
      &note=${params.note}
      &search=${params.search}
      &sort=${params.sort}
      &order=${params.order}`,
      { ...httpOptions, params: paramsLang }
    );
  }

  getDetailMovie(imdb_id: string, userId: string): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId)
      .set('lang', this.translate.getDefaultLang());
    return this.http.get(environment.AUTH_API + `movie/${imdb_id}/detail`, {
      ...httpOptions,
      params,
    });
  }

  download(hash, imdb_id, size, quality, userId: string) {
    let token = this.authService.getToken();
    let uri = environment.AUTH_API + `movie/download?token=${token}`;
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
          reject({ error: err });
        });
    });
  }

  addToFav(movie: any, userId: string): Observable<any> {
    return this.http.post(
      environment.AUTH_API + `movie/${movie.imdb_code}/favorite`,
      {
        movie: movie,
        userId: userId,
      },
      httpOptions
    );
  }

  deleteFav(movie: any, userId: string): Observable<any> {
    return this.http.delete(
      environment.AUTH_API + `movie/${movie.imdb_code}/favorite/${userId}`,
      httpOptions
    );
  }

  getFav(userId: string): Observable<any> {
    return this.http.get(environment.AUTH_API + `movie/favorite/${userId}`, {
      ...httpOptions,
    });
  }

  getWatch(userId: string): Observable<any> {
    let params = new HttpParams().set('lang', this.translate.getDefaultLang());

    return this.http.get(environment.AUTH_API + `movie/watched/${userId}`, {
      ...httpOptions,
      params,
    });
  }
}
