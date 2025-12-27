import { Component, inject } from '@angular/core';
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
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSpinner,CommonModule,MatProgressSpinnerModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
    private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  hide = true; // For password visibility toggle
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
goToLogin() {
    this.router.navigate(['/login']);
  }
  onRegister() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const registerForm = this.registerForm.value; // Matches LoginInput DTO

    this.userService.register(registerForm).subscribe({
      next: () => {
        // Store token in localStorage
        
        this.snackBar.open('Welcome to Neojet, Pilot!', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/home']);
        this.isLoading = false;
      },
      error: (err:any) => {
        console.log(err);
        this.isLoading = false;
        this.snackBar.open('Invalid credentials. Access Denied. '+err, 'Close', {
          panelClass: ['error-snackbar'],
          duration: 5000
        });
      }
    });
  }
}