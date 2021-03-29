import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { YTSService } from '../_services/yts_service';

@Component({
  selector: 'app-detail-movie',
  template: `
    <div *ngIf="detailMovie">
      <img src="{{detailMovie.large_cover_image}}">
      <p>{{detailMovie.title}}</p>
    </div>
  `,
  styleUrls: ['./detail-movie.component.scss']
})
export class DetailMovieComponent implements OnInit {
  id = 0;

  public detailMovie = null;

  constructor(private YTSServices: YTSService,
    private cd: ChangeDetectorRef,
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params["id"];
    this.getMovieDetail(this.id);
  }

  async getMovieDetail(id: number) {
    this.detailMovie = await this.YTSServices.detailYTSMovies(id);
    this.cd.detectChanges();
  }

}
