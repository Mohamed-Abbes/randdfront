import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenApiModel } from '../models/token-api.model';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl: string = 'http://localhost:8090/api/auth/';
  private userPayload: any;
  private isRefreshing = false;
  private currentUser = {
    roles: ['USER'], // Default role
  };

  constructor(private http: HttpClient, private router: Router) {
    this.userPayload = this.decodedToken();
  }

  signUp(userObj: any) {
    return this.http.post<any>(`${this.baseUrl}register`, userObj);
  }

  signIn(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}login`, loginObj);
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

  //Persist the data in local storage to protect it from loss after refresh
  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue);
    this.updateUserPayload();
  }
  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue);
  }

  getToken() {
    return localStorage.getItem('token');
  }
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  decodedToken() {
    const token = this.getToken();
    if (!token) return null;
    const jwtHelper = new JwtHelperService();
    const decodedToken = jwtHelper.decodeToken(token);
    return decodedToken;
  }

  getfullNameFromToken() {
    if (this.userPayload)
      console.log('User name from payload: ' + this.userPayload.userName);
    return this.userPayload.userName;
  }

  getIdFromToken() {
    if (this.userPayload)
      console.log('This is the auth service payload: ' + this.userPayload.id);
    return this.userPayload.id;
  }

  getEmailFromToken() {
    if (this.userPayload)
      console.log(
        'This is the email from auth service payload: ' + this.userPayload.sub
      );
    return this.userPayload.sub;
  }

  getRoleFromToken() {
    const decodedToken = this.decodedToken();
    return decodedToken?.role || null;
  }

  renewToken(tokenApi: TokenApiModel) {
    return this.http.post<any>(`${this.baseUrl}refresh`, tokenApi).pipe(
      tap((response) => {
        this.storeToken(response.token);
        this.storeRefreshToken(response.refreshToken);
      }),
      catchError((error) => {
        this.signOut(); // Clear tokens if refresh fails
        return throwError(() => error);
      })
    );
  }

  // Helper method to check if token is expired
  isTokenExpired(): boolean {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken();
    if (!token) return true;
    return jwtHelper.isTokenExpired(token);
  }

  updateUserPayload() {
    const token = this.getToken();
    if (token) {
      const jwtHelper = new JwtHelperService();
      this.userPayload = jwtHelper.decodeToken(token);
    }
  }
}
