import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string = 'http://localhost:8090/api/users';
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any>(`${this.baseUrl}/all`);
  }

  searchUsers(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search`, {
      params: { term }
    });
  }
  
  updateUser(user: any) {
    console.log(user);
    return this.http.put(`${this.baseUrl}/update/${user.id}`, user);
  }

  deleteUser(userId: number) {
    console.log("User Id of the user to delete: " + userId);
    return this.http.delete(`${this.baseUrl}/delete/${userId}`);
  }

  updateUserRole(userId: number, newRole: string) {
    return this.http.get(`${this.baseUrl}/role/${userId}`);   //, { role: newRole }
  }

  
}

