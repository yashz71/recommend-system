import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { FlightDetail } from './flight-detail/flight-detail';
import { RecommendFlightComponent } from './recommend-flight-component/recommend-flight-component';
import { AdminHomeComponent } from './admin/admin-home-component/admin-home-component';
import { AdminUsersComponent } from './admin/admin-users-component/admin-users-component';
import { AdminFlightsComponent } from './admin/admin-flights-component/admin-flights-component';
import { AddFlightComponent } from './admin/add-flight-component/add-flight-component';
import { AddEditUserComponent } from './admin/add-edit-user-component/add-edit-user-component';
import { ProfileComponent } from './profile-component/profile-component';
export const routes: Routes = [
  { path: 'home', component: Home,canActivate: [authGuard] },
  { path: 'admin/home', component: AdminHomeComponent,canActivate: [adminGuard] },
  { path: 'admin/home/flights', component: AdminFlightsComponent,canActivate: [adminGuard] },
  { path: 'admin/home/users', component: AdminUsersComponent,canActivate: [adminGuard] },
  { path: 'admin/home/add-flight', component: AddFlightComponent,canActivate: [adminGuard] },
  { path: 'admin/home/edit-flight/:id', component: AddFlightComponent,canActivate: [adminGuard] },
  { path: 'admin/home/edit-user/:id', component: AddEditUserComponent,canActivate: [adminGuard] },
  { path: 'admin/home/add-user', component: AddEditUserComponent,canActivate: [adminGuard] },
  { path: 'profile', component: ProfileComponent,canActivate: [authGuard] },

  { path: 'Flight/:flightNumber', component: FlightDetail,canActivate: [authGuard] },
  { path: 'recommended', component: RecommendFlightComponent,canActivate: [authGuard] },
  { path: '', component: Home,canActivate: [authGuard] },
  { path: 'login', component: Login },
  {path: 'register', component: Register}
];