import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { VgApiService } from '@videogular/ngx-videogular/core';

@Component({
  selector: 'app-player',
  template: `
  <vg-player style="width: 100%; height: 200px" *ngIf="loadPlayer" (onPlayerReady)="onPlayerReady($event)">
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
        <!-- <track *ngIf="subtitles && subtitles.eng" kind="subtitles" label="English" [src]="'http://localhost:3000' + subtitles.eng" srclang="en">
        <track *ngIf="subtitles && subtitles.fre" kind="subtitles" label="Français" [src]="'http://localhost:3000' + subtitles.fre" srclang="fr"> -->
    </video>
  </vg-player>
  `,
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public source = null;
  public loadPlayer = false;
  api: VgApiService;
  viewSend = false;

  @Input() imdb_code: string;
  @Input() hash: string;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.source = 'http://localhost:8080/api/' + `movie/watch/${this.imdb_code}?hash=${this.hash}`;
    console.log(this.source);
    this.loadPlayer = true;
    this.cd.detectChanges();
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.progress.subscribe(
      (progress) => {
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
