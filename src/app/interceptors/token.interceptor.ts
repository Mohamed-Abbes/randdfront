import { TokenApiModel } from '../models/token-api.model';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError, BehaviorSubject, filter, take, finalize } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private auth: AuthService, 
    private toast: NgToastService, 
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip adding token for auth requests
    if (request.url.includes('/api/auth/')) {
      return next.handle(request);
    }

    const myToken = this.auth.getToken();
    
    if (myToken) {
      request = this.addTokenHeader(request, myToken);
    }

    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handleUnauthorizedError(request, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If not already refreshing, start the refresh process
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const tokenApiModel = new TokenApiModel();
      tokenApiModel.accessToken = this.auth.getToken() || '';
      tokenApiModel.refreshToken = this.auth.getRefreshToken() || '';

      // If no refresh token, logout immediately
      if (!tokenApiModel.refreshToken) {
        this.auth.signOut();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.auth.renewToken(tokenApiModel).pipe(
        switchMap((tokenData: TokenApiModel) => {
          this.isRefreshing = false;
          
          // Store the new tokens
          this.auth.storeToken(tokenData.accessToken);
          this.auth.storeRefreshToken(tokenData.refreshToken);
          
          // Notify all waiting requests
          this.refreshTokenSubject.next(tokenData.accessToken);
          
          // Retry the original request with new token
          return next.handle(this.addTokenHeader(request, tokenData.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.auth.signOut();
          this.toast.error({ detail: "Session Expired", summary: "Please login again", duration: 5000 });
          this.router.navigate(['login']);
          return throwError(() => err);
        }),
        finalize(() => this.isRefreshing = false)
      );
    } else {
      // If already refreshing, wait until the token is available
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenHeader(request, token));
        })
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}