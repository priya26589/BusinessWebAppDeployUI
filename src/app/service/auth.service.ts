import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // Check if the user is logged in
  }

  logout() {
    localStorage.removeItem('token');
  }
  getToken(): string | null {
    return localStorage.getItem('token'); // Assuming token is stored in localStorage
  }

  getEmailIDFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.EmailId || null; // Ensure the token contains an "email" claim
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
  // Decode token and get email
  getEmailFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.Cus_Id || null; // Ensure the token contains an "email" claim
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getRoleIdFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.RoleID || null; // Ensure the token contains an "email" claim
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
  
}
