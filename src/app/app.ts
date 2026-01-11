import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from './services/user-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public userService = inject(UserService);
  private router = inject(Router);
  protected readonly title = signal('NEOJET');

  ngOnInit() {
    this.userService.checkSession().subscribe({
      next: () => {
        console.log("Session active");
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error("Session check failed", err);
      }
    });
  }
  onGoProfile() {
    
  
      // Navigate to the edit profile page using the current user's ID
      this.router.navigate(['/profile']);
    
  }
adminPage(){
  this.router.navigate(['/admin/home']);
}
  onGoHome() {
    this.router.navigate(['/home']);
  }

  onGoRecommend() {
    this.router.navigate(['/recommended']);
  }
}