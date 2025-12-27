import { Component, AfterViewInit, ElementRef, ViewChild, OnInit,inject  } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import Globe, { GlobeInstance } from 'globe.gl';
import { FlighstService } from '../services/flighst-service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from "@angular/material/card";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    HttpClientModule,
    MatProgressSpinner,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent
],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit ,OnInit {

  public flightService = inject(FlighstService);
  ngOnInit(){
  this.flightService.loadCities();
  }
  minDate: Date = new Date();
  @ViewChild('globeContainer') globeContainer!: ElementRef;
  private world!: GlobeInstance;
  
  departureCoords = { lat: 0, lng: 0 };
  arrivalCoords = { lat: 0, lng: 0 };

  routeForm: FormGroup;
  detailsForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.routeForm = this.fb.group({
      departureCity: [''],
      arrivalCity: ['']
    });
    this.detailsForm = this.fb.group({
      departureDate: [null],
      seatClass: ['Economy'],
      maxPrice: [null]
    });
  }

 ngAfterViewInit() {
const globeInitializer = Globe as any;
    this.world = globeInitializer()(this.globeContainer.nativeElement)
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#00bcd4')
      .pointColor(() => '#ff9800') 
      .pointRadius(.8)            // Larger, more visible point
      .pointAltitude(0.35)         // Slightly raised above surface
      .pointsMerge(true);         // Better for individual markers

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
  // Handle the step change logic
  handleStepChange(event: any) {
    const stepIndex = event.selectedIndex;
    
    // If user is on Step 1: Move to Departure (but don't necessarily leave a point)
    if (stepIndex === 0) {
      this.moveToCity(this.routeForm.value.departureCity, 'departure');
    } 
    // If user is on Step 2: Move to Arrival and SHOW the point
    else if (stepIndex === 1) {
      this.moveToCity(this.routeForm.value.arrivalCity, 'arrival');

    }
    else if (stepIndex  ===  2) {
      this.moveToCity(this.routeForm.value.arrivalCity, 'arrival');

    }
  }

  private moveToCity(city: string, type: 'departure' | 'arrival') {
    if (!city) return;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    
    this.http.get<any[]>(url).subscribe((res: string | any[]) => {
      if (res.length > 0) {
        const coords = { lat: +res[0].lat, lng: +res[0].lon };
        
        if (type === 'departure') {
          this.departureCoords = coords;
          this.world.pointsData([{ 
            lat: coords.lat, 
            lng: coords.lng, 
            label: 'Departure' 
          }]);
          this.world.pointOfView({ ...coords, altitude: 2.0 }, 2000);
        }

        if (type === 'arrival') {
          this.arrivalCoords = coords;
          // Place the point only on the arrival city
          this.world.pointsData([{ 
            lat: coords.lat, 
            lng: coords.lng, 
            label: 'Destination' 
          }]);
          // Animate camera to destination
          this.world.pointOfView({ ...coords, altitude: 1.5 }, 2500);
        }
      }
    });
  }
  onSearch() {
    const searchData = {
      departureCity: this.routeForm.value.departureCity,
      arrivalCity: this.routeForm.value.arrivalCity,
      departureDate: this.detailsForm.value.departureDate?.toISOString().split('T')[0],
      seatClass: this.detailsForm.value.seatClass,
      // Add any other fields your FlightSearchInput expects
    };
  
    this.flightService.search(searchData);
  }
}