import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  roleID: any;
  emailID :any;
  title = 'business';
  dropdownOpen = false;
  constructor(private router: Router, private authService: AuthService) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
    this.dropdownOpen = false;
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
    this.dropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('roleId');
    localStorage.removeItem('email');
    this.authService.logout();
    this.dropdownOpen = false;
    this.router.navigate(['/login']);
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.roleID = localStorage.getItem('roleId');
    this.emailID=localStorage.getItem('email');
  }
  ProfileInfo(){
    this.router.navigateByUrl("/edit-user");
    this.dropdownOpen = false;
  }
  ProfileChangePassword(){
    this.dropdownOpen = false;
    this.router.navigateByUrl("/Change-password");
  }
}
