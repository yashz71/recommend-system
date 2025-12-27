import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user-service';
export const authGuard: CanActivateFn = () => {
  const authService = inject(UserService);
  const router = inject(Router);

  // Check if the user signal is populated
  if (authService.currentUser()) {
    return true;
  }

  // If not connected, redirect to login
  router.navigate(['/login']);
  return false;
};
