import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  apiurl = environment.baseUrl+'Admin';

  constructor(private http: HttpClient) { }
  checkEmailExistsAdmin(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiurl}/check-email?email=${email}`);
  } 
  addSubAdmin(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiurl}/add-sub-admin?email=${email}`,email);
   }
   changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiurl}/change-password`, request);
  }
}
