import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private apiUrl = environment.baseUrl+'Business';
  private cus_ApiUrl = environment.baseUrl+'Customer';
  private businessRating_ApiUrl = environment.baseUrl+'BusinessRating';

  constructor(private http: HttpClient) {}

  registerBusiness(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  updateBusiness(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}`, formData);
  }

  addBusinessRating(formData: any): Observable<any> {
    return this.http.post(`${this.businessRating_ApiUrl}/Add`, formData);
  }
  getBusinessRating(buisnessID: any): Observable<any> {
    return this.http.get(`${this.businessRating_ApiUrl}/${buisnessID}`);
  }
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.cus_ApiUrl}/check-email?email=${email}`);
  }
  checkEmailExistsBusiness(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email?email=${email}`);
  }

  getCustomerDetailsByID(cusId: number): Observable<any> {
    return this.http.get<any>(`${this.cus_ApiUrl}/getcusdetailsbyid?cusId=${cusId}`);
  }  

  registerCustomer(inputdata:any)
  {
    return this.http.post(this.cus_ApiUrl, inputdata);
  }

  searchBusinesses(category: string, subcategory: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?category=${category}&subcategory=${subcategory}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetCategories`);
  }

  getImage(imagename: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getSubCategories(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetSubCategories/${categoryId}`);
  }
  getBusinessDetailById(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getbusinessdetailbyid/${id}`);
  }
  
  getDistance(originLatitude:any, originLongitude:any, destLatitude:any, destLongitude:any): Observable<any[]>{
    
    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?units=metric&origins=${originLatitude},${originLongitude}&destinations=${destLatitude},${destLongitude}&key=${environment.API_KEY}`;
    return this.http.get<any>(url);
  }

  updateBusinessDetails(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatebusinessdetails`, formData);
  }

  updateCustomerDetails(formData: FormData): Observable<any>{
    return this.http.put(`${this.cus_ApiUrl}/updatecustomerdetails`, formData);
  }

}