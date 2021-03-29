import { HttpClientModule } from '@angular/common/http';
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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ProfileComponent,
    NavigationBarComponent,
    ListMoviesComponent,
    DetailMovieComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    InfiniteScrollModule,
  ],
  providers: [authInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}
