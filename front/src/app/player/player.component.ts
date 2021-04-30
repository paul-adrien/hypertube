import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { VgApiService } from '@videogular/ngx-videogular/core';
import { AuthService } from '../_services/auth_service';
import { movieService } from '../_services/movie_service';

@Component({
  selector: 'app-player',
  template: `
    <vg-player
      style="width: 100%; height: calc(100vw / 2)"
      *ngIf="loadPlayer"
      (onPlayerReady)="onPlayerReady($event)"
    >
      <vg-overlay-play></vg-overlay-play>
      <vg-buffering></vg-buffering>

      <vg-controls>
        <vg-play-pause></vg-play-pause>
        <vg-playback-button></vg-playback-button>

        <vg-time-display
          vgProperty="current"
          vgFormat="hh:mm:ss"
        ></vg-time-display>

        <vg-track-selector></vg-track-selector>
        <vg-mute></vg-mute>
        <vg-volume></vg-volume>

        <vg-fullscreen></vg-fullscreen>
      </vg-controls>


      <video
        [vgMedia]="media"
        #media
        id="singleVideo"
        preload="auto"
        crossorigin
      >
        <source *ngIf="qualityChange === 'current' " [src]="this.source" type="video/webm">
        <source *ngIf="qualityChange === '240p' " [src]="this.source" type="video/webm">
        <source *ngIf="qualityChange === '360p' " [src]="this.source" type="video/webm">
        <source *ngIf="qualityChange === '480p' " [src]="this.source" type="video/webm">
        <source *ngIf="qualityChange === '720p' " [src]="this.source" type="video/webm">
        <source *ngIf="qualityChange === '1080p' " [src]="this.source" type="video/webm">
        <source [src]="this.source" type="video/webm">
        <track
          *ngIf="subtitles && subtitles[0]"
          kind="subtitles"
          label="English"
          [src]="
            'http://localhost:8080/api/movie/subtitles/file/' +
            imdb_code +
            '/en?token=' +
            token
          "
          srclang="en"
        />
        <track
          *ngIf="subtitles && subtitles[1]"
          kind="subtitles"
          label="Français"
          [src]="
            'http://localhost:8080/api/movie/subtitles/file/' +
            imdb_code +
            '/fr?token=' +
            token
          "
          srclang="fr"
        />
      </video>
    </vg-player>

    <div *ngIf="loadPlayer">
      <button (click)="this.changeQuality('240p')">240p</button>
      <button *ngIf="quality === '360p' || quality === '480p' || quality === 'x264' || quality === 'XviD' || quality === '720p' || quality === '1080p' || quality === 'BDRip'" (click)="this.changeQuality('360p')">360p</button>
      <button *ngIf="quality === '480p' || quality === 'x264' || quality === 'XviD' || quality === '720p' || quality === '1080p' || quality === 'BDRip'" (click)="this.changeQuality('480p')">480p</button>
      <button *ngIf="quality === '720p' || quality === '1080p' || quality === 'BDRip'" (click)="this.changeQuality('720p')">720p</button>
      <button *ngIf="quality === '1080p' || quality === 'BDRip'" (click)="this.changeQuality('1080p')">1080p</button>
      <br><button (click)="this.changeTime(false)">- 30s</button><button (click)="this.changeTime(true)">+ 30s</button>
    </div>
  `,
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  public source = null;
  public loadPlayer = false;
  public subtitles = [];
  public qualityChange = 'current';
  public currentTime = 0;
  public movieReady = false;

  api: VgApiService;
  viewSend = false;
  token = this.authService.getToken();

  @Input() imdb_code: string;
  @Input() hash: string;
  @Input() quality: string;

  constructor(
    private cd: ChangeDetectorRef,
    private movieService: movieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.source =
      'http://localhost:8080/api' +
      `/movie/convert/${this.hash}/${this.quality}?token=${this.token}`;
    console.log(this.source);
    this.getSubtitles();
    this.cd.detectChanges();
  }

  changeQuality(quality: string) {
    if (quality !== this.qualityChange) {
      this.currentTime = this.api.currentTime;
      console.log(this.currentTime);
      this.source =
        'http://localhost:8080/api' +
        `/movie/convert/${this.hash}/${quality}?token=${this.token}`;
      this.qualityChange = quality;
      console.log(this.source);
      this.cd.detectChanges();
    }
  }

  changeTime(value: boolean) {
    if (value === true)
      this.api.currentTime += 30;
    else if (this.api.currentTime > 30)
      this.api.currentTime -= 30;
    else
      this.api.currentTime = 0;
  }

  getSubtitles() {
    this.movieService.getSubtitles(this.imdb_code).subscribe(
      (data) => {
        console.log(data);
        this.subtitles = data.subs;
        this.loadPlayer = true;
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.loadStart.subscribe(() => {
      this.api.currentTime = this.currentTime;
      this.api.play();
    })
    this.api.getDefaultMedia().subscriptions.progress.subscribe((progress) => {
      console.log(progress);
      if (this.api.canPlay)
        this.movieReady = true;
      if (!progress.srcElement) return;
    });
  }
}
