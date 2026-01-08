import { Injectable, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { UserService } from './user-service';
const GET_CITIES = gql`
  query Cities {
    cities
  }
`;
const BOOK_FLIGHT_MUTATION = gql`
    mutation bookFlight($flightNumber: String!, $userId: String!) {
      bookFlight(flightNumber: $flightNumber, userId: $userId) {
        success
        message
      }
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
const FLIGHT_BY_NUMBER =gql`
query getFlight($flightNumber: String!) {
  getFlight(flightNumber: $flightNumber) {
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
export class FlightsService {
  cities = signal<any[]>([]);
  bookIsValid= signal<boolean>(false);
  private apollo = inject(Apollo);
  private userService = inject(UserService);

  error = signal<any>(null);
  public selectedFlightSignal = signal<any>(null);
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

  search(search: any) {
    this.isSearching.set(true);

    this.apollo.query<any>({
      query: SEARCH_FLIGHTS,
      variables: {
        search
      },
      fetchPolicy: 'network-only' // Ensures we always get fresh results
    }).subscribe({
      next: (result) => {
        this.searchResults.set(result.data.searchFlights);
        console.log("resul fs",result)
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search failed', err);
        this.isSearching.set(false);
      }
    });
  }
  getFlightByNumber(flightNumber: string) {
    console.log('Fetching flight with number:', flightNumber);
    this.isSearching.set(true);

    this.apollo.query<any>({
      query: FLIGHT_BY_NUMBER,
      variables: {
        flightNumber: flightNumber
      },
      fetchPolicy: 'network-only' // Ensures we always get fresh results
    }).subscribe({
      next: (result) => {
        this.selectedFlightSignal.set(result.data.getFlight);
        console.log("resul fs",result)
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search failed', err);
        this.isSearching.set(false);
      }
    });
  }
  confirmBooking(flightNumber: string) {
    const userId = this.userService.currentUser().id; // Replace with actual auth logic
  
    this.apollo.mutate<any>( {
      mutation: BOOK_FLIGHT_MUTATION,
      variables: { flightNumber, userId }
    }).subscribe({
      next: (result) => {
        this.bookIsValid.set(true);
        console.log("resul book",result)
      },
      error: (err) => {
        console.error('book failed', err);
        this.bookIsValid.set(false);
      }
    });
  }


}
