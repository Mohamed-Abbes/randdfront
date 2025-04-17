import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private toast: NgToastService) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    console.log(this.auth.getRoleFromToken());

    // Get required roles from route data
    const requiredRoles = next.data['roles'] as Array<string>;

    // Check if user is authenticated
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // If no specific roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const userRole = this.auth.getRoleFromToken();
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      this.toast.error({
        detail: "ACCESS DENIED", summary: "You don't have permission to access this page!"
      });
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

}
