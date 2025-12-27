import { Component, signal,OnInit,inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from './services/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private userService = inject(UserService);
  private router  = inject(Router);

  ngOnInit(){
    console.log("testing loading");
    console.log("testing check session");
    this.userService.checkSession().subscribe({
      next: () => {
        // Store token in localStorage
        console.log("works fine");
        this.router.navigate(['/home']);
      },
      error: (err:any) => {
        console.log("didn't work");
        console.log(err);
      }});
    console.log("end of testing check session");

  }
  protected readonly title = signal('NEOJET');
}
