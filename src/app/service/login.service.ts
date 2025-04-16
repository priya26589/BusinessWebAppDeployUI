import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import { Observable } from 'rxjs';
import { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  apiurl= environment.baseUrl+'Auth/login';
  baseUrl = environment.baseUrl+'Auth';

  constructor(private http: HttpClient) { }

  onSubmit(usercred:any)
  {
     return this.http.post(this.apiurl, usercred)
  }
  IsLogged()
  {
    return localStorage.getItem("token")!=null;
  }
  GetToken()
  {
    return localStorage.getItem("token") || '';
  }
  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, request);
  }
}
