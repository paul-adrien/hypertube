import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './_services/auth_service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'front';

  public isLog: Observable<boolean> = this.authService.checkIfUserCo().pipe(
    map((el) => {
      const data = JSON.parse(el);
      return data.status;
    })
  );

  constructor(
    private route: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {}
}
