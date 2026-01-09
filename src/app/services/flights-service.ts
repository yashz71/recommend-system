import { Injectable, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { UserService } from './user-service';
import { Router } from '@angular/router';
const GET_FLIGHT_METADATA = gql`
 query GetFlightMetadata {
    getFlightMetadata {
      airlines {
        code
        name
      }
      airports {
        code
        city
      }
    }
  }
`;
const DELETE_FLIGHT = gql`
mutation deleteFlight($flightNumber: String!){
  deleteFlight(flightNumber: $flightNumber)

  
}
`;
const CREATE_FLIGHT = gql`
  mutation CreateFlight($input: CreateFlightInput!) {
    createFlight(input: $input) {
      flightNumber
    }
  }
`;
const GET_CITIES = gql`
  query Cities {
    cities
  }
`;
const GET_ALL_FLIGHTS= gql`
query getFlights {
  getFlights {
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
const BOOK_FLIGHT_MUTATION = gql`
    mutation bookFlight($flightNumber: String!, $userId: String!) {
      bookFlight(flightNumber: $flightNumber, userId: $userId) {
        success
        message
      }
    }
  `;

const RECOMMENDED_FLIGHTS_BY_OTHERS = gql`
query getRecommendedFlightsByOthers($userId: String!) {
  getRecommendedFlightsByOthers(userId: $userId) {
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
const RECOMMENDED_FLIGHTS_BY_BOOKING = gql`
query getRecommendedFlightsByBooking($userId: String!) {
  getRecommendedFlightsByBooking(userId: $userId) {
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
export interface Airline {
  code: string;
  name: string;
}

export interface Airport {
  code: string;
  city: string;
}

export interface FlightMetadata {
  airlines: Airline[];
  airports: Airport[];
}
@Injectable({
  providedIn: 'root',
})
export class FlightsService {
  cities = signal<any[]>([]);
  bookIsValid= signal<boolean>(false);
  private apollo = inject(Apollo);
  private userService = inject(UserService);
  private router = inject(Router);
public allFlights= signal<any[]>([]);
  error = signal<any>(null);
  public selectedFlightSignal = signal<any>(null);
  public recommendedFlightsByOthers = signal<any[]>([]);
    public recommendedFlightsByBooking = signal<any[]>([]);
public metadata = signal<FlightMetadata | null>(null);
  searchResults = signal<any[]>([]);
  isSearching = signal<boolean>(false);
  deleteFlight(flightNumber: String){
    
    this.apollo.mutate<any>({
      mutation: DELETE_FLIGHT,
      variables: {
        flightNumber: flightNumber
      }
    }).subscribe({
      next: (result) => {
        if (result.data.deleteFlight) {
          // 3. Update the UI Signal locally so the card disappears
          this.allFlights.update((flights: any[]) => 
            flights.filter(f => f.flightNumber !== flightNumber)
          );
          console.log('Flight deleted successfully from Neo4j');
        }
      },
      error: (error) => {
        console.error('Delete failed', error);
        alert('Error: You might not have the permissions to delete flights.');
      }
    });
  
  }
  getFlightMetaData(){
    this.apollo.watchQuery<any>({
      query: GET_FLIGHT_METADATA,
    }).valueChanges.subscribe({
      next: (result) => {
          console.log("Metadata test :",result);

        if (result.data?.getFlightMetadata) {
        this.metadata.set(result.data.getFlightMetadata);
        
        console.log("Signal updated with:", this.metadata());
      }
      },
      error: (err: any) => {
                  console.log("Metadata test :",err);

        console.error("Metadata Load Error:", err);
        this.error.set(err.message || 'Failed to load flight metadata');
      }
    });
  }
  addFlight(input: any) {
  return this.apollo.mutate<any>({
    mutation: CREATE_FLIGHT,
    variables: {
      input
    }
  }).subscribe({
    next: (result) => {
      const newFlight = result.data.createFlight;
      
      // Update the signal so the list of flights updates in real-time
      this.allFlights.update(flights => [...flights, newFlight]);
      
      console.log('Flight created successfully:', newFlight);
      this.router.navigate(['/flights']); // Redirect after success
    },
    error: (err) => {
      console.error('Error creating flight:', err);
      // You can set an error signal here to show a message in the UI
    }
  });
}
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
  getAllFlights() {

    this.apollo.query<any>({
      query: GET_ALL_FLIGHTS,
      fetchPolicy: 'network-only' // Ensures we always get fresh results
    }).subscribe({
      next: (result) => {
        this.allFlights.set(result.data.getFlights);
      },
      error: (err) => {
        console.error('fetch failed', err);
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
  
  getRecommendationByBooking() {
    const userId = this.userService.currentUser().id; // Replace with actual auth logic
  
    this.apollo.query<any>( {
      query: RECOMMENDED_FLIGHTS_BY_BOOKING,
      variables:  { userId } 
    }).subscribe({
      next: (result) => {
        this.recommendedFlightsByBooking.set(result.data.getRecommendedFlightsByBooking);
        console.log("resul recbybooking",result)
      },
      error: (err) => {
        console.error('rec failed', err);
      }
    });
  }
  getRecommendationByOthers() {
    const userId = this.userService.currentUser().id; // Replace with actual auth logic
  
    this.apollo.query<any>( {
      query: RECOMMENDED_FLIGHTS_BY_OTHERS,
      variables:  { userId }
    }).subscribe({
      next: (result) => {
        this.recommendedFlightsByOthers.set(result.data.getRecommendedFlightsByOthers);

        console.log("resul recbyother",result)
      },
      error: (err) => {
        console.error('rec failed', err);
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
            this.router.navigate(['/recommended']);

        console.log("resul book",result)
      },
      error: (err) => {
        console.error('book failed', err);
        this.bookIsValid.set(false);
      }
    });
  }


}
