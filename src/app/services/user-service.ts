import { Injectable, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { tap, catchError, of,map } from 'rxjs';
import { AddEditUserComponent } from '../admin/add-edit-user-component/add-edit-user-component';
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
const ADD_USER = gql`
mutation AddUser($registerInput: RegisterInput!) {
  addUser(registerInput: $registerInput) {
    user {
      
      username
      
    }
  }
}
`;
const UPDATE_USER = gql`
mutation UpdateUser($id: String!, $input: input!) {
  updateProfile(id: $id, input: $input) {
  
      username
      
    
  }
}
`;
const  DELETE_USER= gql`
mutation DeleteUser($id: String!){
  removeUser(id: $id)
  
}
`;

const GET_USERS = gql`
  query AllUsers {
    user {
        email
        username
        roles
      
    }
  }
`;
@Injectable({ providedIn: 'root' })
export class UserService {

  private apollo = inject(Apollo);
  currentUser = signal<any>(null); 
  allUsers = signal<any[]>([]); 


  getAllUsers(){
    return this.apollo.query<any>({
      query: GET_USERS
      ,
      fetchPolicy: 'network-only' // Ensure we don't get a cached 'null'
      }).pipe( map(result => result.data.users),
      tap((users) => {
      this.allUsers.set(users);
      console.log(this.allUsers());
      
      })
      );
  }
  // Signal to hold the current user globally
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
  delUser(id: String){
    return this.apollo.mutate<any>({
      mutation: DELETE_USER,
      variables: { id }
    }).pipe(
      tap(result => {
        if (result.data?.removeUser) {
          this.allUsers.update(users => users.filter(u => u.id !== id));
        }
      })
    );

  }
  updateUser(id: String, input:any){
    return this.apollo.mutate<any>({
      mutation:  UPDATE_USER,
      variables: { id, input }
    }).pipe(
      map(result => result.data.updateUser)
    );

  }
  addUser(registerInput: any) { 
    return this.apollo.mutate<any>({
      mutation: ADD_USER,
      variables: { registerInput }
    }).pipe(
      map((result: { data: { add: any; }; }) => result.data.add),
      tap((authResponse: { user: any; }) => {
        if(authResponse.user) return true;
        else{
          return false;
        }
      })
    );
  } 
}