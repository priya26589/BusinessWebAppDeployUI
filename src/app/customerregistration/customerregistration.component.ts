import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule } from "@angular/google-maps";
import { BusinessService } from '../service/business.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customerregistration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, GoogleMapsModule, RouterLink],
  providers: [BusinessService],
  templateUrl: './customerregistration.component.html',
  styleUrl: './customerregistration.component.css'
})
export class CustomerregistrationComponent implements OnInit {
  title = 'Register Customer'
  cusRegisterForm: FormGroup;
  fileUpload: any;
  saveresponse: any;
  messageclass = '';
  message = '';
  emailExists: boolean = false;
  isHidden = true;
  private messageService = inject(BusinessService);

  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
  zoom = 10;
  marker: google.maps.LatLngLiteral | null = null;

  constructor(private fb: FormBuilder, private businessService: BusinessService, private router: Router) {
    this.cusRegisterForm = this.fb.group({
      Cus_Id: [0],
      Cus_EmailId: ['', [Validators.required, Validators.email]],
      Cus_Password: ['', [Validators.required, Validators.minLength(6)]],
      Cus_Location: ['', [Validators.required]],
      Latitude: [8.3],
      Longitude: [9.3],
    });
  }

  ngOnInit(): void {
    this.getCurrentLocation();

  }

  checkEmail() {
    const email = this.cusRegisterForm.get('Cus_EmailId')?.value;
    if (email) {
      this.businessService.checkEmailExists(email).subscribe({
        next: (exists) => {
          this.emailExists = exists;
        },
        error: () => {
          this.emailExists = false;
        }
      });
    }
  }
  // Getter for Email Field
  get emailID() {
    return this.cusRegisterForm.get('Cus_EmailId');
  }

  // Getter for Password Field
  get password() {
    return this.cusRegisterForm.get('Cus_Password');
  }

  // Getter for Location Field
  get location() {
    return this.cusRegisterForm.get('Cus_Location');
  }


  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.center = { lat, lng };
          this.marker = { ...this.center };
          this.getLocationName(lat, lng); // Fetch and display the location name
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not retrieve your location. Default location will be used.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.marker = { lat, lng };
      this.getLocationName(lat, lng); // Fetch and display the new location name
    }
  }

  onLocationInput(): void {
    const location = this.cusRegisterForm.controls['Cus_Location'].value;
    if (location) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          this.center = { lat, lng };
          this.marker = { lat, lng };
          this.updateLocationFields(location, lat, lng);
        } else {
          alert('Could not find the location. Please try again.');
        }
      });
    }
  }

  getLocationName(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const locationName = results[0].formatted_address;
        this.updateLocationFields(locationName, lat, lng);
      } else {
        console.error('Error fetching location name:', status);
      }
    });
  }

  updateLocationFields(location: string, lat: number, lng: number): void {
    this.cusRegisterForm.controls['Cus_Location'].setValue(location);
    this.cusRegisterForm.controls['Latitude'].setValue(lat);
    this.cusRegisterForm.controls['Longitude'].setValue(lng);
  }

  submit(): void {

    if (this.emailExists) {
      this.message = 'Email is already registered!';
      return;
    }
    // Check if the form is valid
    if (!this.cusRegisterForm.valid) {
      this.showAlert("Form is invalid. Please check the inputs.", "error");
      return;
    }

    console.log('Form Submitted', this.cusRegisterForm.value);
    this.businessService.registerCustomer(this.cusRegisterForm.value).subscribe({
      next: (response) => {
        if (response) {
          // Show success popup using SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Successfully registered!',
            confirmButtonText: 'OK',
          });

          //this.registerForm.reset();
          this.router.navigateByUrl('/login');
        } else {
          // Show failure popup using SweetAlert2
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Registration failed!',
            confirmButtonText: 'Try Again',
          });
        }
      },
      error: (error) => {
        // Handle errors during registration
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred during registration. Please try again.',
          confirmButtonText: 'Close',
        });
        this.cusRegisterForm.reset();
        console.error('Registration error:', error);
      }
    });
  }

  private onRegisterSuccess(response: { data?: string }): void {
    this.saveresponse = response;

    // Check the response data
    if (response?.data === 'pass') {
      this.showAlert("Saved Successfully", "success");
      this.cusRegisterForm.reset();
    } else {
      this.showAlert("Save failed", "error");
    }
  }

  private onRegisterError(error: any): void {
    console.error("Error during registration:", error);

    // Fallback error message
    const errorMessage = error?.message || "An unexpected error occurred. Please try again.";
    this.showAlert(errorMessage, "error");
    this.cusRegisterForm.reset();
  }

  private showAlert(message: string, type: "success" | "error"): void {
    // Replace with a UI library like SweetAlert2 or Material Dialog for better user experience
    alert(message);
    // Optional: Log the alert for debugging purposes
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}
