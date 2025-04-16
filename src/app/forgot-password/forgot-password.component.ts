import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import { CommonModule } from '@angular/common';
import { LoginService } from '../service/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers:[LoginService],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  goToLogin() {
    this.router.navigate(['/login']); // Navigate to the login page
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    const request: ForgotPasswordRequest = this.forgotPasswordForm.value;
    this.loginService.forgotPassword(request).subscribe({
      next: res => {
        this.message = res.message;
        this.error = '';
      },
      error: err => {
        this.error = err.error || 'Something went wrong';
        this.message = '';
      }
    });
  }
}
