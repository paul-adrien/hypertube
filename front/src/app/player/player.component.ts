import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
        <source
          *ngIf="qualityChange === 'current'"
          [src]="this.source"
          type="video/webm"
        />
        <source
          *ngIf="qualityChange === '240p'"
          [src]="this.source"
          type="video/webm"
        />
        <source
          *ngIf="qualityChange === '360p'"
          [src]="this.source"
          type="video/webm"
        />
        <source
          *ngIf="qualityChange === '480p'"
          [src]="this.source"
          type="video/webm"
        />
        <source
          *ngIf="qualityChange === '720p'"
          [src]="this.source"
          type="video/webm"
        />
        <source
          *ngIf="qualityChange === '1080p'"
          [src]="this.source"
          type="video/webm"
        />
        <source [src]="this.source" type="video/webm" />
        <track
          *ngIf="subtitles && subtitles[0]"
          kind="subtitles"
          label="English"
          id="en"
          [src]="
            'http://localhost:8080/movie/' +
            imdb_code +
            '/subtitles/file/en?token=' +
            token
          "
          srclang="en"
        />
        <track
          *ngIf="subtitles && subtitles[1]"
          kind="subtitles"
          label="Français"
          id="fr"
          [src]="
            'http://localhost:8080/movie/' +
            imdb_code +
            '/subtitles/file/fr?token=' +
            token
          "
          srclang="fr"
        />
      </video>
    </vg-player>

    <div class="option" *ngIf="loadPlayer">
      <select>
        <option (click)="this.changeQuality('240p')">240p</option>
        <option
          *ngIf="
            quality === '360p' ||
            quality === '480p' ||
            quality === 'x264' ||
            quality === 'XviD' ||
            quality === '720p' ||
            quality === '1080p' ||
            quality === 'BDRip'
          "
          (click)="this.changeQuality('360p')"
        >
          360p
        </option>
        <option
          *ngIf="
            quality === '480p' ||
            quality === 'x264' ||
            quality === 'XviD' ||
            quality === '720p' ||
            quality === '1080p' ||
            quality === 'BDRip'
          "
          (click)="this.changeQuality('480p')"
        >
          480p
        </option>
        <option
          *ngIf="
            quality === '720p' || quality === '1080p' || quality === 'BDRip'
          "
          (click)="this.changeQuality('720p')"
        >
          720p
        </option>
        <option
          *ngIf="quality === '1080p' || quality === 'BDRip'"
          (click)="this.changeQuality('1080p')"
        >
          1080p
        </option>
      </select>
    </div>
  `,
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy {
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
  @Input() lang: string;

  constructor(
    private cd: ChangeDetectorRef,
    private movieService: movieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.source =
      'http://localhost:8080' +
      `/movie/convert/${this.hash}/${this.quality}?token=${this.token}&userId=${user.id}`;
    this.getSubtitles();
    this.cd.detectChanges();
  }
  ngOnDestroy() {
    window.location.reload();
  }

  changeQuality(quality: string) {
    if (quality !== this.qualityChange) {
      this.currentTime = this.api.currentTime;
      this.source =
        'http://localhost:8080' +
        `/movie/convert/${this.hash}/${quality}?token=${this.token}`;
      this.qualityChange = quality;
      this.cd.detectChanges();
    }
  }

  getSubtitles() {
    this.movieService.getSubtitles(this.imdb_code).subscribe(
      (data) => {
        this.subtitles = data.subs;
        console.log(this.subtitles)
        this.loadPlayer = true;
        this.cd.detectChanges();
      },
      (err) => {

      }
    );
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.loadStart.subscribe(() => {
      this.api.currentTime = this.currentTime;
      this.api.play();
    });
    this.api.getDefaultMedia().subscriptions.progress.subscribe((progress) => {
      if (this.api.canPlay) this.movieReady = true;
      if (!progress.srcElement) return;
    });
  }
}
