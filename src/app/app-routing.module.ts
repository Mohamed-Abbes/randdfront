import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { HomeComponent } from './components/home/home.component';
import { ModeratorComponent } from './components/moderator/moderator.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: NewPasswordComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } // Only ADMIN can access
  },
  {
    path: 'moderator',
    component: ModeratorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MODERATOR'] } // ADMIN or MODERATOR can access
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
