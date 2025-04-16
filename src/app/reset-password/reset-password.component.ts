import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import { CommonModule } from '@angular/common';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [LoginService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  token: string = '';
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    // Retrieve token from query parameter
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  // Custom validator to check if passwords match
  passwordsMatchValidator(formGroup: AbstractControl) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  // Custom validator to check if newPassword and confirmPassword match
  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }
    const request: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.resetPasswordForm.get('newPassword')?.value
    };
    this.loginService.resetPassword(request).subscribe({
      next: res => {
        this.message = res.text;
        this.error = '';
        alert("Password reset successfully.");
        // Optionally navigate to the login page after reset
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.error = err.error || 'Something went wrong';
        this.message = '';
      }
    });
  }
}
