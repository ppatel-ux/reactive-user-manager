import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user.model';
import { UsersResponse } from '../models/users-response.model';

@Injectable({
  //Makes the service available through Angular's dependency injection system
  // without registering it manually in every component
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  //Gives the service access to Angular's HTTP client. We use this to send GET and PUT requests.

  private readonly apiUrl = 'https://dummyjson.com/users';

  getUsers(): Observable<UsersResponse> {
    //returns an observable of UsersResponse, which is a wrapper object containing an array of User objects
    // and metadata about the response, async result which we can subscribe to in the component to get the data when it arrives.

    //We use HttpParams to set the 'limit' parameter to 0, which means we want to fetch all users without any limit on the number of results.
    const params = new HttpParams().set('limit', 0);

    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  searchUsers(username: string): Observable<UsersResponse> {
    const params = new HttpParams().set('q', username);

    return this.http.get<UsersResponse>(`${this.apiUrl}/search`, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(
    id: number,
    changes: Partial<User>, //only the fields that need to be updated are sent in the request body,
    //so we use Partial<User> to allow for partial updates
  ): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, changes);
  }
}
