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
  private userService = inject(UserService);
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

  onGoHome() {
    this.router.navigate(['/home']);
  }

  onGoRecommend() {
    this.router.navigate(['/recommended']);
  }
}