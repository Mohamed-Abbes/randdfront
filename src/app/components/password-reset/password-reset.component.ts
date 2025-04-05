import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  passwordresetForm: FormGroup;
  message: string = '';
  isError: boolean = false;
  private baseUrl: string = 'http://localhost:8090/api/auth/';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.passwordresetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.passwordresetForm.valid) {
      const email = this.passwordresetForm.value.email;
      
      this.http.post(`${this.baseUrl}request-password-reset`, { email })
        .subscribe({
          next: (response: any) => {
            this.message = response.message || 'Password reset link sent to your email!';
            this.isError = false;
          },
          error: (error) => {
            this.message = error.error?.message || 'An error occurred. Please try again.';
            this.isError = true;
          }
        });
    }
  }
}