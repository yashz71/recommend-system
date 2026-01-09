
import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { FlightsService } from '../../services/flights-service'; // Adjust path based on your structure
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-admin-flights-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-flights-component.html',
  styleUrl: './admin-flights-component.css',
})
export class AdminFlightsComponent implements OnInit {
  flightService = inject(FlightsService);
  showSearch = false;
  routeForm: FormGroup;
  detailsForm: FormGroup;
  public router = inject(Router);

  constructor( private fb: FormBuilder) {
    this.routeForm = this.fb.group({
      departureCity: [''],
      arrivalCity: ['']
    });
    this.detailsForm = this.fb.group({
      departureDate: [null], // For One-Way
      seatClass: ['Economy'],
      maxPrice: [null]
    });
  }
  ngOnInit() {
    this.loadAllFlights();
  }

   loadAllFlights() {
    // Assuming your service returns a signal or observable
     this.flightService.getAllFlights();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  onDelete(flightNumber: string) {
    if (confirm(`Delete flight ${flightNumber} permanently?`)) {
      this.flightService.deleteFlight(flightNumber);
    }
  }

  onEdit(flight: any) {
    // Open a dialog or navigate to edit page
  }

  onAddFlight() {
this.router.navigate(['admin/home/add-flight']);
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
