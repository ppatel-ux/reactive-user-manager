import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User, UserInput, UsersResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  // httpclient return observables

  private readonly apiUrl = 'https://caf6bde20c74ff9c0a8a.free.beeceptor.com/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[] | UsersResponse>(this.apiUrl).pipe(
      map((response) => (Array.isArray(response) ? response : response.users)),
    );
  }

  getUserDetails(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`); //for a particular user
  }

  createUser(user: UserInput): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: UserInput): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<unknown>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }
}
