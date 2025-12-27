import { Injectable, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { tap, catchError, of,map } from 'rxjs';
const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      user {
        email
        username
        roles
      }
    }
  }
`;
const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      user {
        email
        username
        roles
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class UserService {
  private apollo = inject(Apollo);
  
  // Signal to hold the current user globally
  currentUser = signal<any>(null); 
  checkSession() {
    return this.apollo.query<any>({
    query: gql`
    query GetMe {
    me {
    id
    username
    roles
    }
    }
    `,
    fetchPolicy: 'network-only' // Ensure we don't get a cached 'null'
    }).pipe( map(result => result.data.me),
    tap((me) => {
    this.currentUser.set(me);
    console.log(this.currentUser());
    
    })
    );
    }

  login(loginInput: any) {
    return this.apollo.mutate<any>({
      mutation: LOGIN_MUTATION,
      variables: { loginInput }
    }).pipe(
      map(result => result.data.login),
      tap((authResponse: { user: any; }) => {
        // Store the token and update the user signal
        this.currentUser.set(authResponse.user);
      })
    );
  }
  register(registerInput: any) { 
    return this.apollo.mutate<any>({
      mutation: REGISTER_MUTATION,
      variables: { registerInput }
    }).pipe(
      map((result: { data: { register: any; }; }) => result.data.register),
      tap((authResponse: { user: any; }) => {
        // Store the token and update the user signal
        this.currentUser.set(authResponse.user);
      })
    );
  } 
}