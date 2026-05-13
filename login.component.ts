import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
     private authService: AuthService 
  ) {

    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { userId, password } = this.loginForm.value;

    //   BACKEND LOGIN (JWT)
    this.http.post<any>('http://localhost:5000/api/auth/login', {
      userId,
      password
    }).subscribe({
      next: (res) => {
        console.log("LOGIN RESPONSE:", res); 

         if (!res.token) {
        alert("Login failed: No token received");
        return;
      }

        // STORE JWT TOKEN
       this.authService.loginSuccess(res.token, res.role);
        // redirect
        this.router.navigate(['/dashboard']);
      },

      error: () => {
        console.error();
        alert('Invalid Credentials');
      }
    });
  }
}
