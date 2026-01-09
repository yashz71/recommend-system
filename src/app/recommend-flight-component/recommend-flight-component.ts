import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlightsService } from '../services/flights-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-recommend-flight-component',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './recommend-flight-component.html',
  styleUrl: './recommend-flight-component.css',
})
export class RecommendFlightComponent implements OnInit {
  public flightsService = inject(FlightsService);
  loading = false;
private router = inject(Router);
  ngOnInit() {
    // 1. Trigger both API calls
    this.flightsService.getRecommendationByBooking();
    this.flightsService.getRecommendationByOthers();

    // 2. Clear loading state
    // We use a slight delay to ensure the AI "Analyzing" feel and signal sync
   
  }
  viewDetails(flightNumber: string) {
    // Navigate to /flight/FL123
    this.router.navigate(['/Flight', flightNumber]);
  }
  
}