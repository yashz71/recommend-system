import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-users-component',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],  templateUrl: './admin-users-component.html',
  styleUrl: './admin-users-component.css',
})
export class AdminUsersComponent {
  public userService = inject(UserService);
  private router = inject(Router);

  users = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.userService.getAllUsers();  
  }

  
  onAddUser() {
    this.router.navigate(['admin/home/add-user']);
  }

  onEditUser(userId: string) {
    this.router.navigate(['admin/home/edit-user', userId]);
  }

  onDeleteUser(userId: string) {
    if (confirm('CAUTION: PERMANENTLY ERASE USER IDENTITY FROM GRAPH?')) {
      this.userService.delUser(userId);
    }
  }
}
