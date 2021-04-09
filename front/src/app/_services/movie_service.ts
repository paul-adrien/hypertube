import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import axios from "axios";
export var searchCancelTokenFetch = { id: null, source: null };

const AUTH_API = 'http://localhost:8080/api/';

const httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
};

@Injectable({
    providedIn: "root",
})
export class movieService {
    constructor(private http: HttpClient, private route: Router) { }

    // watchMovie(imdb_id: string, hash: string): Observable<any> {
    //     console.log(AUTH_API + `movie/watch/${imdb_id}?hash=${hash}`);
    //     return this.http.get(AUTH_API + `movie/watch/${imdb_id}?hash=${hash}`);
    // }

    getSubtitles(imdb_id: string): Observable<any> {
        return this.http.get(AUTH_API + `movie/subtitles/${imdb_id}`);
    }

}