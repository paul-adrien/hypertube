import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { List } from 'libs/movie';
import { movieService } from '../_services/movie_service';
import { YTSService } from '../_services/yts_service';

@Component({
  selector: 'app-list-movies',
  template: `
  <div class="body">
    <p>Films:</p>
    <div class="list" infiniteScroll (scrolled)="onScrollDown()" [scrollWindow]="false">
      <div *ngFor="let movie of this.moviesList" (click)="viewDetail(movie.imdb_code)">
        <div *ngIf="movie && movie.poster && movie.title">
          <img src="{{movie.poster}}" style='height: 200px; width: 200px'>
          <p>{{movie.title}}</p>
        </div>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./list-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListMoviesComponent implements OnInit {

  public pageNum = 1;
  public moviesList = [];

  constructor(private YTSServices: YTSService,
    private cd: ChangeDetectorRef,
    private route: Router,
    private movieService: movieService) { }

  ngOnInit(): void {
    this.getMovieList(this.pageNum);
  }

  onScrollDown() {
    this.getMovieList(++this.pageNum);
  }

  getMovieList(page: number) {
    this.movieService.getListMovies(page, null, "rating").subscribe(
      (data) => {
        if (!this.moviesList || this.moviesList.length == 0)
          this.moviesList = data.movies;
        else
          this.moviesList = this.moviesList.concat(data.movies);
        console.log(data);
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  viewDetail(imdb_code) {
    this.route.navigate(['/detail-movie/' + imdb_code]);
  }

}
