import { SignupComponent } from './components/signup/signup.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgToastModule } from 'ng-angular-popup';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { EditUserModalComponent } from './modal/edit-user-modal/edit-user-modal.component';
import { DeleteConfirmModalComponent } from './modal/delete-confirm-modal/delete-confirm-modal.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { HomeComponent } from './components/home/home.component';
import { ModeratorComponent } from './components/moderator/moderator.component';
import { TruncatePipe } from './helpers/truncate.pipe';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    PasswordResetComponent,
    EditUserModalComponent,
    DeleteConfirmModalComponent,
    NewPasswordComponent,
    HomeComponent,
    ModeratorComponent,
    TruncatePipe,
    NavBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgToastModule,
    CommonModule
    ],
  providers: [{
    provide:HTTP_INTERCEPTORS,
    useClass:TokenInterceptor,
    multi:true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
