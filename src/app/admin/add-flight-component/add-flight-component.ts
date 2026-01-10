import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlightsService } from '../../services/flights-service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router'; 
@Component({
  selector: 'app-add-flight-component',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatDatepickerModule, 
    MatButtonModule, MatIconModule],
    providers: [provideNativeDateAdapter()], // 2. Add this provider
  templateUrl: './add-flight-component.html',
  styleUrl: './add-flight-component.css',
})


export class AddFlightComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute); // To get the flight ID
  private router = inject(Router);
  public flightService = inject(FlightsService);
  flightForm: FormGroup;
  metadata = signal<any>(null);
  loading = signal(false);
  minDate: Date = new Date();
  isEditMode = signal(false); // Track mode
  constructor() {
    this.flightForm = this.fb.group({
      flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{3,4}$/)]],
      airlineCode: ['', Validators.required],
      depAirportCode: ['', Validators.required],
      arrAirportCode: ['', Validators.required],
      departure: ['', Validators.required],
      duration: [0, Validators.required]
    });
  }

  ngOnInit() {
console.log("Fetching flight metadata...");
    this.flightService.getFlightMetaData();
    const flightNumber = this.route.snapshot.paramMap.get('id');
    if (flightNumber) {
      this.isEditMode.set(true);
      this.flightService.getFlightByNumber(flightNumber);
      setTimeout(() => {
        this.loadFlightForEdit();
      }, 2000);
    }
  }
  loadFlightForEdit() {
    this.loading.set(true);
    const flight  = this.flightService.selectedFlightSignal();
console.log("flight njn: ",flight)
      if (flight) {
        this.flightForm.patchValue({
          flightNumber: flight.flightNumber,
          airlineCode: flight.airline.code,
          depAirportCode: flight.departureAirport.code,
          arrAirportCode: flight.arrivalAirport.code,
          departure: flight.departure, // Raw Date object
          arrival: this.formatDate(this.flightForm.value.departure), 
          duration: flight.duration
        });
      }
    
      this.loading.set(false);
    
  }

 private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    d.setDate(d.getDate());

    d.setHours(12, 0, 0, 0); 
    return d.toISOString().split('T')[0];
  }
  onSubmit() {
    if (this.flightForm.valid) {
      this.loading.set(true);
       const createData = {
       flightNumber: this.flightForm.value.flightNumber,
      airlineCode: this.flightForm.value.airlineCode,
      depAirportCode: this.flightForm.value.depAirportCode,
      arrAirportCode: this.flightForm.value.arrAirportCode,
      departure: this.formatDate(this.flightForm.value.departure), // Raw Date object
      arrival: this.formatDate(this.flightForm.value.departure),   // Raw Date object
      duration: Number(this.flightForm.value.duration)
    };
       console.log("Creating flight with data:", createData);
       if (this.isEditMode()) {
        console.log("update data: ", createData)
        this.flightService.updateFlight(this.flightForm.value.flightNumber,createData)
           this.loading.set(false);
       }
       else {
        this.flightService.addFlight(createData); // Your existing add logic
      }

      
    }
  }
}