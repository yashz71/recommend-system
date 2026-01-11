import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlightsService } from '../services/flights-service';
@Component({
  selector: 'app-profile-component',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
    templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  private router = inject(Router);
  public flightService = inject(FlightsService);

  isUpdating = signal(false);
  editMode = signal(false);

  ngOnInit() {
    const user = this.userService.currentUser();
    this.flightService.getHasBooked();
  }
  isPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }
  

 
  

 
  

  onLogout() {
    this.isUpdating.set(true); // Re-use loading state for effect
    
    this.userService.logout().subscribe({
      next: () => {
        console.log('Session Terminated.');
      },
      error: (err) => {
        console.error('Logout failed, forcing local clear', err);
        // Fallback: reload anyway to try and clear state
        window.location.reload();
      }
    });
  }

}
