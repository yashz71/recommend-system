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


const UPDATE_ADMIN = gql`
  mutation UpdateAdmin($id: String!, $input: UpdateUserInput!) {
    updateAdmin(id: $id, input: $input) {
      id
      username
      email
      roles
    }
  }
`;
const  DELETE_USER= gql`
mutation DeleteUser($id: String!){
  removeUser(id: $id)
  
}
`;
const ADD_USER = gql`
  mutation AddUser($addUserInput: AddUserInput!) {
    addUser(addUserInput: $addUserInput) {
      id        # No 'user {}' wrapper because backend returns User directly
      username
      email 
      roles
    }
  }
`;
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $input: UpdateUserInput!) { # Use UpdateUserInput type
    updateProfile(id: $id, input: $input) {
      id
      username
      email
      roles
    }
  }
`;

const GET_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      username
      email
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
    console.log("getUSERS in service is starting");
  return this.apollo.query<any>({
    query: GET_USERS,
    fetchPolicy: 'network-only'
  }).subscribe({
    next: (result) => {
      if (result.data.allUsers) {
        console.log('users fetched successfully from Neo4j',result.data.allUsers );
        this.allUsers.set(result.data.allUsers);
      };
      
    },
    error: (error) => {
      console.error('fetch failed', error);
      alert('Error: You might not have the permissions to fetch users.');
    }});
  }
  logout() {
    return this.apollo.mutate({
      mutation: LOGOUT_MUTATION
    }).pipe(
      tap(() => {
        this.currentUser.set(null); // Clear local signal
        // Force reload to clear all cached states and reset the app
        window.location.href = '/login'; 
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
    }).subscribe({
      next: (result) => {
        if (result.data.removeUser) {
          // 3. Update the UI Signal locally so the card disappears
          this.allUsers.update((users: any[]) => 
            users.filter(f => f.id !== id)
          );
          console.log('user deleted successfully from Neo4j');
        }
      },
      error: (error) => {
        console.error('Delete failed', error);
        alert('Error: You might not have the permissions to delete users.');
      }
    });

  }
  addUser(addUserInput: any) {
    return this.apollo.mutate<any>({
      mutation: ADD_USER,
      variables: { addUserInput }
    }).pipe(
      map(result => result.data.addUser), // Removed .user nesting
      tap(newUser => {
        this.allUsers.update(users => [...users, newUser]);
      })
    );
  }

  updateUser(id: string, input: any) {
    return this.apollo.mutate<any>({
      mutation: UPDATE_USER,
      variables: { id, input }
    }).pipe(
      map(result => result.data.updateProfile), // Matches the mutation call name
      tap(updatedUser => {
        this.allUsers.update(users => 
          users.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      })
    );
  }
  updateAdmin(id: string, input: any) {
    return this.apollo.mutate<any>({
      mutation: UPDATE_ADMIN,
      variables: { id, input }
    }).pipe(
      map(result => result.data.updateAdmin), // Directly returns User
      tap(updatedUser => {
        // Find and replace the user in the signal list
        this.allUsers.update(users => 
          users.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      })
    );
  }
  
 
}