import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-add-edit-user-component',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './add-edit-user-component.html',
  styleUrl: './add-edit-user-component.css',
})
export class AddEditUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public userService = inject(UserService);

  userForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  userId: string | null = null;

  availableRoles = ['USER', 'ADMIN'];

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.userId);
    this.initForm();

    if (this.isEditMode() && this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      roles: [[], Validators.required],
      // Only add password field if NOT in edit mode
      ...( !this.isEditMode() ? { password: ['', [Validators.required, Validators.minLength(6)]] } : {})
    });
  }

  loadUserDetails(id: string) {
    this.loading.set(true);
    // Assuming you have a way to find a user in your local signal or a direct fetch
    const user = this.userService.allUsers().find((u: { id: string; }) => u.id === id);
    
    if (user) {
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        roles: user.roles
      });
    }
    this.loading.set(false);
  }
  onAbort(){
    this.router.navigate(['admin/home/users']);

  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading.set(true);
      const payload = this.userForm.value;

      const request = this.isEditMode() 
        ? this.userService.updateAdmin(this.userId!, payload) 
        : this.userService.addUser(payload);

      request.subscribe({
        next: () => {
          this.router.navigate(['admin/home/users']);
        },
        error: (err) => {
          console.error("Operation failed", err);
          this.loading.set(false);
        }
      });
    }
  }
}