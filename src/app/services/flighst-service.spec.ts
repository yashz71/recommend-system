import { TestBed } from '@angular/core/testing';

import { FlighstService } from './flighst-service';

describe('FlighstService', () => {
  let service: FlighstService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlighstService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
