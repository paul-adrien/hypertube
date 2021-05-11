import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { authInterceptorProviders } from './_helpers/auth-interceptor';
import { ProfileComponent } from './profile/profile.component';
import { NavigationBarComponent } from './nav-bar/nav-bar.component';
import { ListMoviesComponent } from './list-movies/list-movies.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DetailMovieComponent } from './detail-movie/detail-movie.component';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { PlayerComponent } from './player/player.component';
import { PopUpComponent } from './pop-up/pop-up.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterAndSortComponent } from './filter-and-sort/filter-and-sort.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ForgotPassSendComponent } from './forgot-pass-send/forgot-pass-send.component';
import { ForgotPassChangeComponent } from './forgot-pass-change/forgot-pass-change.component';
import { OtherProfileComponent } from './other-profile/other-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ProfileComponent,
    NavigationBarComponent,
    ListMoviesComponent,
    DetailMovieComponent,
    PlayerComponent,
    PopUpComponent,
    FilterAndSortComponent,
    ForgotPassSendComponent,
    ForgotPassChangeComponent,
    OtherProfileComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    InfiniteScrollModule,
    BrowserModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    MatDialogModule,
    VgBufferingModule,
    NgxSliderModule,
    MatProgressSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  entryComponents: [PopUpComponent],
  providers: [authInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
