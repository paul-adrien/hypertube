import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import axios from 'axios';
export var searchCancelTokenFetch = { id: null, source: null };

const AUTH_API = 'http://localhost:8080/api/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class movieService {
  constructor(private http: HttpClient, private route: Router) {}

  // watchMovie(imdb_id: string, hash: string): Observable<any> {
  //     console.log(AUTH_API + `movie/watch/${imdb_id}?hash=${hash}`);
  //     return this.http.get(AUTH_API + `movie/watch/${imdb_id}?hash=${hash}`);
  // }

  getSubtitles(imdb_id: string): Observable<any> {
    return this.http.get(AUTH_API + `movie/subtitles/${imdb_id}`);
  }

  getListMovies(
    userId: string,
    page: number,
    genre: string,
    sort: string,
    note?: number,
    search?: string
  ): Observable<any> {
    if (genre === 'Tout' || genre === undefined || genre === 'Genre') {
      genre = 'all';
    }
    return this.http.post(
      AUTH_API + 'movie/list',
      {
        userId: userId,
        page: page,
        genre: genre,
        note: note ? note : 0,
        sort: sort,
        search: search ? search : '',
      },
      httpOptions
    );
  }

  getDetailMovie(imdb_id: string, userId: string): Observable<any> {
    let params = new HttpParams().set('userId', userId);
    return this.http.get(AUTH_API + `movie/detail/${imdb_id}`);
  }

  download(hash, imdb_id, size, quality, userId: string) {
    let uri = `http://localhost:8080/api/movie/download`;
    return new Promise((fullfil, reject) => {
      axios
        .post(uri, {
          hash: hash,
          movieId: imdb_id,
          size: size,
          quality: quality,
          userId: userId,
        })
        .then((result) => {
          fullfil(result);
        })
        .catch((err) => {
          console.error(err);
          reject({ error: err });
        });
    });
  }
}
