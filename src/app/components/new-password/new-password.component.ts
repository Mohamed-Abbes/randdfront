import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;
  private baseUrl: string = 'http://localhost:8090/api/auth/';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.message = 'Invalid password reset link. Please request a new one.';
        this.isError = true;
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.isLoading = true;
      const { password } = this.resetForm.value;
      
      this.http.post(`${this.baseUrl}reset-password`, { token: this.token, newPassword: password })
        .subscribe({
          next: (response: any) => {
            this.message = response.message || 'Password reset successfully! You can now login with your new password.';
            this.isError = false;
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: (error) => {
            this.message = error.error?.message || 'An error occurred. Please try again.';
            this.isError = true;
            this.isLoading = false;
          }
        });
    }
  }
}