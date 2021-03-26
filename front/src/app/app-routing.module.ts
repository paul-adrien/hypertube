import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './_services/auth-guard';

const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "home",
    component: HomeComponent,
    children: [
    { path: "profile", canActivate: [AuthGuard], component: ProfileComponent },
    ],
  },
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  { path: "**", redirectTo: "/home",
  pathMatch: "full", },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
