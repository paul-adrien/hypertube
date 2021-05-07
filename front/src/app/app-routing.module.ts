import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailMovieComponent } from './detail-movie/detail-movie.component';
import { HomeComponent } from './home/home.component';
import { ListMoviesComponent } from './list-movies/list-movies.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './_services/auth-guard';
import { ProfileGuard } from './_services/profile-guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [ProfileGuard] },
  {
    path: 'home',
    component: HomeComponent,
  },
  { path: 'profile', canActivate: [AuthGuard], component: ProfileComponent },
  {
    path: 'list-Movies',
    canActivate: [AuthGuard],
    component: ListMoviesComponent,
  },
  {
    path: 'detail-movie/:imdb_code',
    canActivate: [AuthGuard],
    component: DetailMovieComponent,
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
