import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {


  public fullName: string = "";
  public role!: string;
  hasModeratorAccess: boolean = false;
  hasAdminAccess: boolean = false;


  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.fullName = this.auth.getfullNameFromToken();
    this.role = this.auth.getRoleFromToken();
    this.roles();
    console.log("Is admin: " + this.hasAdminAccess);
    console.log("Is Moderator: " + this.hasModeratorAccess);

  }

  logout() {
    this.auth.signOut();
  }

  roles(): void {
    this.role = this.auth.getRoleFromToken();
    if (this.role === 'ADMIN') {
      this.hasAdminAccess = true;
    }
    else if (this.role === 'MODERATOR') {
      this.hasModeratorAccess = true;
    }

  }


}