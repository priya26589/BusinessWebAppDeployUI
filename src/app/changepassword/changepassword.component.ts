import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../service/admin.service';
import { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AdminService],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent {
  changePasswordForm: FormGroup;
  token: string | null = null;
  message: string = '';
  error: string = '';
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordsMatch: boolean = true;

  constructor(private fb: FormBuilder, private adminService: AdminService, private router: Router,
    private route: ActivatedRoute, private authService: AuthService) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },{ validator: this.checkPasswords });
  }
  ngOnInit(): void {
    this.token = this.authService.getToken();
    console.log("token", this.token)
  }

  // Custom validator to check if newPassword and confirmPassword match
  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onConfirmPasswordBlur() {
    this.checkPasswordsMatch();
  }

  // Compare new password and confirm password
  checkPasswordsMatch() {
    this.newPassword = this.changePasswordForm.get('newPassword')?.value;
    this.confirmPassword = this.changePasswordForm.get('confirmPassword')?.value;
    if (this.newPassword !== this.confirmPassword) {
      this.passwordsMatch = false;
    } else {
      this.passwordsMatch = true;
    }
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      return;
    }
    const request: ChangePasswordRequest = {
      currentPassword: this.changePasswordForm.get('currentPassword')?.value,
      newPassword: this.changePasswordForm.get('newPassword')?.value,
      token: this.token
    };

    this.adminService.changePassword(request).subscribe({
      next: res => {
        this.message = res.text;
        this.error = '';
        alert("Password changed successfully.");
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
