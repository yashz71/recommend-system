import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSpinner,CommonModule,MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  hide = true; // For password visibility toggle
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  goToRegister() {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const loginInput = this.loginForm.value; // Matches LoginInput DTO

    this.userService.login(loginInput).subscribe({
      next: () => {
        // Store token in localStorage
        
        this.snackBar.open('Welcome to Neojet, Pilot!', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/home']);
        this.isLoading = false;
      },
      error: (err:any) => {
        this.isLoading = false;
        this.snackBar.open('Invalid credentials. Access Denied. '+err, 'Close', {
          panelClass: ['error-snackbar'],
          duration: 5000
        });
      }
    });
  }
}