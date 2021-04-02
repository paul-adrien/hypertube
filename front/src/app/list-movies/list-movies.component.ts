import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { YTSService } from '../_services/yts_service';

@Component({
  selector: 'app-list-movies',
  template: `
  <div class="body">
    <p>Films:</p>
    <div class="list" infiniteScroll (scrolled)="onScrollDown()" [scrollWindow]="false">
      <div *ngFor="let movie of this.ListYTS" (click)="viewDetail(movie.id)">
        <img src="{{movie.backPoster}}" style='height: 200px; width: 200px'>
        <p>{{movie.title}}</p>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./list-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListMoviesComponent implements OnInit {

  public ListYTS = [];
  public pageNum = 1;

  constructor(private YTSServices: YTSService,
    private cd: ChangeDetectorRef,
    private route: Router) { }

  ngOnInit(): void {
   this.getMovies(this.pageNum);
  }

  onScrollDown() {
    this.pageNum++;
    this.getMovies(this.pageNum);
  }

  async getMovies(page: number) {
    if (this.ListYTS.length == 0)
      this.ListYTS = await this.YTSServices.ListYTSMovies(page, null, "title");
    else
      this.ListYTS = this.ListYTS.concat(await this.YTSServices.ListYTSMovies(page, null, "title"));
    this.cd.detectChanges();
  }

  viewDetail(id) {
    this.route.navigate(['/detail-movie/' + id]);
  }

}
