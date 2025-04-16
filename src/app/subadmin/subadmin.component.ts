import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../service/admin.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-subadmin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,HttpClientModule],
  providers: [AdminService],
  templateUrl: './subadmin.component.html',
  styleUrl: './subadmin.component.css'
})
export class SubadminComponent {
  loginFormSubadmin: FormGroup;
  responsedata: any;
  errorMessage: string | null = null;
  isButtonDisabled: boolean = false;
  getemail: string = '';
  emailExists: boolean = false;
  message = '';

  constructor(private fb: FormBuilder, private subadminservice: AdminService, private router: Router) {
    localStorage.clear();
    // Initialize the form
    this.loginFormSubadmin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    console.log("this", this.email);
  }

  //Getters for form controls
  get email() {
    return this.loginFormSubadmin.get("email");
  }

  checkEmailAdmin() {
    const email = this.loginFormSubadmin.get('email')?.value;
    if (email) {
      this.subadminservice.checkEmailExistsAdmin(email).subscribe({
        next: (exists) => {
          this.emailExists = exists;
        },
        error: () => {
          this.emailExists = false;
        }
      });
    }
  }

  onSubmitSubadmin() {
    if (this.loginFormSubadmin.invalid) {
      return;
    }
    if (this.emailExists == true) {
      this.message = 'Email is already registered!';   
      return;   
    }
    if (this.loginFormSubadmin.valid) {
      this.isButtonDisabled = true;
      this.subadminservice.addSubAdmin(this.loginFormSubadmin.get("email")?.value).subscribe({
        next: (response) => {
          if (response) {
            // Show success popup using SweetAlert2
            let displayIcon: SweetAlertIcon = response.messege == 'success'? 'success':'error';
            let title = response.messege == 'success'? 'success':'Duplicate record';
            let text = response.messege == 'success'? 'Email user has added as sub-admin and notified the same in email with a default password to login.'
                                                    : 'This email is already registered.';
            let confirmButtonText = response.messege == 'success'? 'OK':'Try Again!';
            Swal.fire({
              icon: displayIcon,
              title: title,
              text: text,
              confirmButtonText: confirmButtonText,
            });
            //this.registerForm.reset();
            this.router.navigateByUrl('/login');
          } else {
            // Show failure popup using SweetAlert2
            let resp = response;

            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Registration failed!',
              confirmButtonText: 'Try Again',
            });
          }
        },
        error: (error) => {
          // Handle errors during registration
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred during registration. Please try again.',
            confirmButtonText: 'Close',
          });
          this.loginFormSubadmin.reset();
          console.error('Registration error:', error);
        }
      });
    }
    else {
      alert('Please enter a valid EmailId');
      this.isButtonDisabled = false;
    }
  }
}
