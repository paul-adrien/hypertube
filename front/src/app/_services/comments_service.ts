import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Comment } from 'libs/comments';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
};

@Injectable({
  providedIn: "root",
})
export class commentsService {
  constructor(private http: HttpClient) { }

  addComment(comment: any, imdb_id: string, username: string): Observable<any> {
    return this.http.post(
      environment.AUTH_API + `comment/${imdb_id}`,
      {
        comment: comment.comment,
        imdb_id: imdb_id,
        username: username
      },
      httpOptions
    );
  }

  getComments(imdb_id: string): Observable<any> {
    return this.http.get(environment.AUTH_API + `comment/${imdb_id}`);
  }
}