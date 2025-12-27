import { Injectable, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
const GET_CITIES = gql`
  query Cities {
    cities
  }
`;
const SEARCH_FLIGHTS =gql`
query SearchFlights($search: FlightSearchInput!) {
  searchFlights(search: $search) {
    flightNumber
    departure
    arrival
    duration
    airline {
      code
      name
    }
    departureAirport {
      code
      city {
        name
        country
      }
    }
    arrivalAirport {
      code
      city {
        name
        country
      }
    }
    prices {
      type
      amount
      currency
    }
  }
}
`;
@Injectable({
  providedIn: 'root',
})
export class FlighstService {
  cities = signal<any[]>([]);
  private apollo = inject(Apollo);
  error = signal<any>(null);
  loadCities() {

    this.apollo.watchQuery<{ cities: string[] }>({
      query: GET_CITIES,
    }).valueChanges.subscribe({
      next: (result) => {
        // result.data.cities is exactly ["London", "Tokyo", ...]
        if (result.data?.cities) {
          this.cities.set(result.data.cities);
        }},
      error: (err: any) => { 
        this.error.set(err);
      }
    });
  }
  searchResults = signal<any[]>([]);
  isSearching = signal<boolean>(false);

  search(criteria: any) {
    this.isSearching.set(true);

    this.apollo.query<any>({
      query: SEARCH_FLIGHTS,
      variables: {
        search: criteria
      },
      fetchPolicy: 'network-only' // Ensures we always get fresh results
    }).subscribe({
      next: (result) => {
        this.searchResults.set(result.data.searchFlights);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search failed', err);
        this.isSearching.set(false);
      }
    });
  }
}
