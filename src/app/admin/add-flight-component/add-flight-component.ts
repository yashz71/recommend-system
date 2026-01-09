import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlightsService } from '../../services/flights-service';
@Component({
  selector: 'app-add-flight-component',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatDatepickerModule, 
    MatButtonModule, MatIconModule],
  templateUrl: './add-flight-component.html',
  styleUrl: './add-flight-component.css',
})


export class AddFlightComponent implements OnInit {
  private fb = inject(FormBuilder);
  public flightService = inject(FlightsService);
  flightForm: FormGroup;
  metadata = signal<any>(null);
  loading = signal(false);

  constructor() {
    this.flightForm = this.fb.group({
      flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{3,4}$/)]],
      airlineCode: ['', Validators.required],
      depAirportCode: ['', Validators.required],
      arrAirportCode: ['', Validators.required],
      departure: ['', Validators.required],
      arrival: ['', Validators.required],
      duration: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.loadMetadata();
  }

  loadMetadata() {
    this.flightService.getFlightMetaData();

  }

  onSubmit() {
    if (this.flightForm.valid) {
      this.loading.set(true);
      const input = {
        ...this.flightForm.value,
        duration: Number(this.flightForm.value.duration)
      };

      
    }
  }
}