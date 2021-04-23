import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { VgApiService } from '@videogular/ngx-videogular/core';
import { movieService } from '../_services/movie_service';
import videojs from 'video.js';

@Component({
  selector: 'app-player',
  template: `
  <vg-player style="width: 100%; height: 400px" *ngIf="loadPlayer" (onPlayerReady)="onPlayerReady($event)">
    <vg-overlay-play></vg-overlay-play>
    <vg-buffering></vg-buffering>

    <vg-scrub-bar>
      <vg-scrub-bar-current-time></vg-scrub-bar-current-time>
      <vg-scrub-bar-buffering-time></vg-scrub-bar-buffering-time>
    </vg-scrub-bar>

    <vg-controls>
      <vg-play-pause></vg-play-pause>
      <vg-playback-button></vg-playback-button>

      <vg-time-display vgProperty="current" vgFormat="hh:mm:ss"></vg-time-display>

      <vg-scrub-bar style="pointer-events: none;"></vg-scrub-bar>

      <vg-time-display vgProperty="total" vgFormat="hh:mm:ss"></vg-time-display>

      <vg-track-selector></vg-track-selector>
      <vg-mute></vg-mute>
      <vg-volume></vg-volume>

      <vg-fullscreen></vg-fullscreen>
    </vg-controls>

    <video [vgMedia]="media" #media id="singleVideo" preload="auto" crossorigin [src]="this.source">
        <track *ngIf="subtitles && subtitles[0]" kind="subtitles" label="English" [src]="'http://localhost:8080/api/movie/subtitles/file/'+imdb_code+'/en'" srclang="en">
        <track *ngIf="subtitles && subtitles[1]" kind="subtitles" label="Français" [src]="'http://localhost:8080/api/movie/subtitles/file/'+imdb_code+'/fr'" srclang="fr">
    </video>
  </vg-player>
  `,
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public source = null;
  public loadPlayer = false;
  public subtitles = [];
  api: VgApiService;
  viewSend = false;

  @Input() imdb_code: string;
  @Input() hash: string;
  @Input() quality: string;

  constructor(private cd: ChangeDetectorRef,
    private movieService: movieService) { }

  ngOnInit(): void {
    this.source = 'http://localhost:8080/' + `convert/${this.hash}/${this.quality}`;
    console.log(this.source);
    this.getSubtitles();
    this.cd.detectChanges();
  }

  getSubtitles() {
    this.movieService.getSubtitles(this.imdb_code).subscribe(
      data => {
        console.log(data);
        this.subtitles = data.subs;
        this.loadPlayer = true;
        this.cd.detectChanges();
      },
      err => {
        console.log(err);
      }
    );
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.progress.subscribe(
      (progress) => {
        console.log(progress);
        if (!progress.srcElement)
          return;

        let percent = (progress.srcElement.currentTime / progress.srcElement.duration) * 100;

        if (!isNaN(percent) && percent >= 85 && this.viewSend === false) {
          this.viewSend = true;
        }
      }
    );
  }

}
