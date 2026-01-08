import { Component, OnInit, inject, AfterViewInit,ViewChild,ElementRef, effect } from '@angular/core';
import { FlightsService } from '../services/flights-service';
import { CommonModule } from '@angular/common'; // Required for pipes like | date
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import Globe, { GlobeInstance } from 'globe.gl';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CommonModule,MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule,MatProgressSpinnerModule], // Added CommonModule for the date pipe and other utilities
  templateUrl: './flight-detail.html',
  styleUrl: './flight-detail.css',
})
export class FlightDetail implements OnInit, AfterViewInit {
  @ViewChild('globeContainer') globeContainer!: ElementRef;
  private world!: GlobeInstance;
  
  private http = inject(HttpClient);
  
  departureCoords: { lat: number; lng: number } | null = null;
  arrivalCoords: { lat: number; lng: number } | null = null;
  private route = inject(ActivatedRoute);
  readonly flightNumber: string;
  constructor() {
    
    this.flightNumber = this.route.snapshot.paramMap.get('flightNumber')!;
    effect(() => {
      const flight = this.flightService.selectedFlightSignal();
      if (flight) {
        this.lookupAndDraw(flight.departureAirport.city.name, flight.arrivalAirport.city.name);
      }
    });
  }
  // Services
  flightService = inject(FlightsService);
  private router = inject(Router);

  // Sidebar State
  isSidebarOpen = false;
  ngAfterViewInit() {
    const globeInitializer = Globe as any;
        this.world = globeInitializer()(this.globeContainer.nativeElement)
          .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true)
          .atmosphereColor('#00bcd4')
          // --- Arcs Configuration ---
      .arcColor(() => '#00bcd4')
      .arcDashLength(0.4)
      .arcDashGap(0)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1000)
      .arcStroke(1.5)
      .arcAltitude(0.5)
      .pointColor(() => '#00bcd4')
      .pointRadius(0.8)
      .pointAltitude(0.01);         // Better for individual markers
    
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    resize() {
        if (this.world && this.globeContainer) {
          const container = this.globeContainer.nativeElement;
          this.world.width(container.clientWidth);
          this.world.height(container.clientHeight);
        }
      }
      private async lookupAndDraw(depCity: string, arrCity: string) {
        // 1. Get Departure Coords
        const depRes = await this.getCoords(depCity);
        // 2. Get Arrival Coords
        const arrRes = await this.getCoords(arrCity);
    
        if (depRes && arrRes) {
          this.departureCoords = depRes;
          this.arrivalCoords = arrRes;
    
          // Draw markers for both cities
          this.world.pointsData([
            { lat: depRes.lat, lng: depRes.lng, label: depCity },
            { lat: arrRes.lat, lng: arrRes.lng, label: arrCity }
          ]);
    
          // Draw the connecting arc
          this.world.arcsData([{
            startLat: depRes.lat,
            startLng: depRes.lng,
            endLat: arrRes.lat,
            endLng: arrRes.lng
          }]);
    
          // Center view between the two cities
          const midLat = (depRes.lat + arrRes.lat) / 2;
          const midLng = (depRes.lng + arrRes.lng) / 2;
          this.world.pointOfView({ lat: midLat, lng: midLng, altitude: 2.5 }, 2000);
        }
      }
      private getCoords(city: string): Promise<{lat: number, lng: number} | null> {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        return new Promise((resolve) => {
          this.http.get<any[]>(url).subscribe({
            next: (res) => {
              if (res.length > 0) resolve({ lat: +res[0].lat, lng: +res[0].lon });
              else resolve(null);
            },
            error: () => resolve(null)
          });
        });
      }
  ngOnInit() {
    console.log("fligh N: ",this.flightNumber)
    this.flightService.getFlightByNumber(this.flightNumber);
  }

  // Action Methods
  openPaymentSidebar() { 
    this.isSidebarOpen = true; 
  }

  closeSidebar() { 
    this.isSidebarOpen = false; 
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  confirmPayment() {
    console.log('Processing payment for flight:', this.flightNumber);
    this.flightService.confirmBooking(this.flightNumber);
    this.router.navigate(['/recommended']);

  }
}