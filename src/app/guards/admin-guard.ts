import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user-service';
export const adminGuard: CanActivateFn = () => {
    const authService = inject(UserService);
    const router = inject(Router);
    const user = authService.currentUser();
  
    // 1. Check if user is logged in and has roles
    if (user && user.roles) {
      // 2. Check if the 'ADMIN' role is included in the array
      const isAdmin = user.roles.includes('ADMIN');
  
      if (isAdmin) {
        return true;
      }
    }
  
    // 3. If not an admin, redirect (e.g., to home or unauthorized page)
    router.navigate(['/login']); 
    return false;
  };

