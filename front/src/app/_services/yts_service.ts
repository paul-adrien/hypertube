import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import axios from "axios";
export var searchCancelTokenFetch = { id: null, source: null };


const YTS_LIST = "https://yts.megaproxy.info/api/v2/list_movies.json";
const YTS_DETAIL = "https://yts.megaproxy.info/api/v2/movie_details.json";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
};

@Injectable({
  providedIn: "root",
})
export class YTSService {
  constructor(private http: HttpClient, private route: Router) { }

  async ListYTSMovies(page: number, genre: string, sort: string) {
    const source = axios.CancelToken.source();
    searchCancelTokenFetch.source = source;
    const data = await axios.get(YTS_LIST, {
      params: {
        page: page,
        genre: genre,
        sort_by: sort,
        order_by: 'asc'
      },
      withCredentials: false,
      cancelToken: searchCancelTokenFetch.source.token,
    });
    const modifiedData = data.data.data.movies.map((m) => ({
      id: m["id"],
      backPoster: m["medium_cover_image"],
      popularity: m["rating"],
      title: m["title"],
      poster: m["medium_cover_image"],
      overview: m["summary"],
      rating: m["rating"],
      year: m["year"],
    }));
    return modifiedData;
  }

  async detailYTSMovies(movie_id: number) {
    const source = axios.CancelToken.source();
    searchCancelTokenFetch.source = source;
    const data = await axios.get(YTS_DETAIL, {
      params: {
        movie_id,
        with_images: true,
        with_cast: true,
      },
      withCredentials: false,
      cancelToken: searchCancelTokenFetch.source.token,
    });
    console.log(data.data.data.movie);
    return data.data.data.movie;
  }
}