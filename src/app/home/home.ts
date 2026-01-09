import { Component, AfterViewInit, ElementRef, ViewChild, OnInit,inject,signal  } from '@angular/core';
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
import { MatStepperModule,MatStepper } from '@angular/material/stepper';
import Globe, { GlobeInstance } from 'globe.gl';
import { FlightsService } from '../services/flights-service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from "@angular/material/card";
import { Router } from '@angular/router';

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
    MatCardContent
],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit ,OnInit {
  public router = inject(Router);
  @ViewChild('stepper') stepper!: MatStepper; // Add this to reset stepper on toggle

  public flightService = inject(FlightsService);
  ngOnInit(){
  this.flightService.loadCities();
  }
  oneWay = signal(true);
roundTrip=signal(false);
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
      // Keep both possible date formats in the same form to avoid errors
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      }),
      departureDate: [null], // For One-Way
      seatClass: ['Economy'],
      maxPrice: [null]
    });
  }
  get dateRangeGroup(): FormGroup {
    return this.detailsForm.get('dateRange') as FormGroup;
  }
  viewDetails(flightNumber: string) {
    // Navigate to /flight/FL123
    this.router.navigate(['/Flight', flightNumber]);
  }

 ngAfterViewInit() {
const globeInitializer = Globe as any;
const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg';
    this.world = globeInitializer()(this.globeContainer.nativeElement)
      .globeImageUrl(img.src)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#00bcd4')
      .pointColor(() => '#00bcd4') 
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
  onRoundTrip() {
    this.roundTrip.set(true);
    this.oneWay.set(false);
    this.stepper.reset(); // Clear progress when switching modes
  }

  onOneWay() {
    this.roundTrip.set(false);
    this.oneWay.set(true);
    this.stepper.reset();
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
  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    d.setDate(d.getDate());

    d.setHours(12, 0, 0, 0); 
    return d.toISOString().split('T')[0];
  }
  onSearch() {
    const range = this.detailsForm.value.dateRange;
    // const rawDate = this.detailsForm.value.departureDate;
    // let formattedDate = undefined;

    // if (rawDate) {
    //   const d = new Date(rawDate);
    //   // 2. Set time to noon to prevent timezone shifts
    //   d.setDate(d.getDate());
    //   // 2. Set to noon to stay safely within the date boundary during UTC conversion
    //   d.setHours(12, 0, 0, 0);
    //   // 3. Convert to ISO and grab only the YYYY-MM-DD part
    //   formattedDate = d.toISOString().split('T')[0];
    //   }
    const isRT = this.roundTrip();
    if(isRT){
      const searchData = {
        departureCity: this.routeForm.value.departureCity,
        arrivalCity: this.routeForm.value.arrivalCity, 
        departureDate: this.formatDate(range.start),
        returnDate: this.formatDate(range.end), 
        seatClass: this.detailsForm.value.seatClass
      };
    
      console.log('Final Search Payload:', searchData);
      this.flightService.search(searchData);
    }
    
    else{
      const searchData = {
        departureCity: this.routeForm.value.departureCity,
        arrivalCity: this.routeForm.value.arrivalCity, 
        departureDate: this.formatDate(this.detailsForm.value.departureDate),
        seatClass: this.detailsForm.value.seatClass
      };
    
      console.log('Final Search Payload:', searchData);
      this.flightService.search(searchData);
    }
    
  }
}

