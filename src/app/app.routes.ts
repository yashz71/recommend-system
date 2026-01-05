import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { authGuard } from './guards/auth-guard';
import { FlightDetail } from './flight-detail/flight-detail';
export const routes: Routes = [
  { path: 'home', component: Home,canActivate: [authGuard] },
  { path: 'Flight/:flightNumber', component: FlightDetail,canActivate: [authGuard] },

{ path: '', component: Home,canActivate: [authGuard] },
  { path: 'login', component: Login },
  {path: 'register', component: Register}
];