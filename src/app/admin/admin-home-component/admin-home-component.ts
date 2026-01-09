import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home-component',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './admin-home-component.html',
  styleUrl: './admin-home-component.css',
})
export class AdminHomeComponent {
  private router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
