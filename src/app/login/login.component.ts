import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LoginService } from '../service/login.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  providers: [LoginService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  responsedata: any;
  roleId: any;
  isPasswordChanged: any;
  errorMessage: string | null = null;
  isButtonDisabled: boolean = false;
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private service: LoginService, private router: Router) {
    localStorage.clear();
    // Initialize the form
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Getters for form controls
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Example method to set an error message
  handleLoginError() {
    this.errorMessage = 'Invalid username or password';
  }

  // Method to clear the error message
  clearError() {
    this.errorMessage = null;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isButtonDisabled = true;
      const loginData = this.loginForm.value;
      this.service.onSubmit(loginData).subscribe({
        next: (result) => {          
          this.responsedata = result;
          if (this.responsedata != null && this.responsedata.token) {
            // Store the token in local storage
            localStorage.setItem('token', this.responsedata.token);
            localStorage.setItem("roleId",this.responsedata.roleId);
            const email = this.extractEmailFromToken(this.responsedata.token);
          if (email) {
            localStorage.setItem("email", email);
          }
            const domainID = this.extractDomainIDFromToken(this.responsedata.token);
            if (domainID) {
              localStorage.setItem("domainID", domainID);
            }
            if (this.responsedata.roleId == 3 || this.responsedata.roleId == 4) {
              // Navigate to the business search page
              this.router.navigateByUrl('/Businesssearch');
            }
            if (this.responsedata.roleId == 1) {
              // Navigate to the add sub admin page
              this.router.navigateByUrl('/Subadmin');
              console.log("return token", this.responsedata)
            }
            if(this.responsedata.roleId == 2 && this.responsedata.isPasswordChanged == false) 
            {
              // Navigate to the change password page             
              this.router.navigateByUrl('/Change-password')
              console.log("return token", this.responsedata)
            }
            if(this.responsedata.roleId == 2 && this.responsedata.isPasswordChanged == true) 
              {
                // Navigate to the business search page
                this.router.navigateByUrl('/Businesssearch');                
              }
          } else {
            // If token is not available, show a failed login message
            alert('Login Failed!');
            this.isButtonDisabled = false;
          }
        },
        error: (error) => {
          this.isButtonDisabled = false;
          // Handle HTTP error responses like Unauthorized (401)
          if (error.status === 401) {
            alert('Incorrect username or password. Unauthorized!');
          } else {
            // Generic error message for any other errors
            alert('An error occurred during login. Please try again.');
          }
        }
      });
    } else {
      alert('Enter valid username and password!');
      this.isButtonDisabled = false;
    }
  }

  extractEmailFromToken(token: string): string | null {
    try {
      // Split the JWT token and decode the payload (Base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
  
      // Extract email from the payload
      return  payload["EmailId"] || payload["Email"] || null
    } catch (error) {
      console.error("Error decoding JWT token", error);
      return null;
    }
  }

  extractDomainIDFromToken(token: string): string | null {
    try {
      // Decode the JWT token payload (Base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
  
      // Extract BusinessID or cus_Id (whichever exists)
      return payload["BusinessID"] || payload["Cus_Id"] || null;
    } catch (error) {
      console.error("Error decoding JWT token", error);
      return null;
    }
  }
  
  
}
