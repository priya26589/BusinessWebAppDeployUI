import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessService } from '../service/business.service';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from "@angular/google-maps";
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-registerbusiness',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, GoogleMapsModule, RouterLink],
  providers: [BusinessService],
  templateUrl: './registerbusiness.component.html',
  styleUrl: './registerbusiness.component.css'
})
export class RegisterbusinessComponent implements OnInit {
  registerForm: FormGroup;
  categories: any[] = [];
  subCategories: any[] = [];
  fileUpload: any;
  emailExists: boolean = false;
  message = '';
  isHidden = true;
  private messageService = inject(BusinessService);

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 }; // Default to San Francisco
  zoom = 10;
  marker: google.maps.LatLngLiteral | null = null;
  fileName: string | undefined;
  imagePreview: string | undefined;

  constructor(private fb: FormBuilder, private businessService: BusinessService,private router: Router) {
    this.registerForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      EmailId: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      Description: ['', [Validators.required, Validators.maxLength(500)]],
      // Location: ['',[Validators.required]],
      location: new FormControl('', [Validators.required]),
      Latitude: [8.3],
      Longitude: [9.3],

      CategoryID: ['', [Validators.required]],
      BusinessID: [0, [Validators.required]],
      SubCategoryID: ['', [Validators.required]],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.getCurrentLocation();
    this.getCategories();
  }
  
  checkEmail() {
    const email = this.registerForm.get('EmailId')?.value;
    if (email) {
      this.businessService.checkEmailExistsBusiness(email).subscribe({
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
    return this.registerForm.get('EmailId');
  }

  get FormVal() {
    return this.registerForm.value
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.center = { lat, lng };
          this.marker = { ...this.center };
          this.getLocationName(lat, lng); // Fetch and set the location name
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
  
  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.marker = { lat, lng };
      this.getLocationName(lat, lng); // Fetch and set the location name
    }
  }
  
  onLocationInput(): void {
    const location = this.registerForm.controls['location'].value;
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
    this.registerForm.controls['location'].setValue(location);
    this.registerForm.controls['Latitude'].setValue(lat);
    this.registerForm.controls['Longitude'].setValue(lng);
  }
  

  getCategories(): void {
    this.businessService.getCategories().subscribe((data) => {
      this.categories = data;
      if (!this.FormVal?.CategoryID) {
        this.registerForm.controls['CategoryID'].setValue(data[0]?.categoryID)
        this.getSubCategories();
      }
    });
  }

  getSubCategories() {
    this.businessService.getSubCategories(this.FormVal?.CategoryID).subscribe((result: any) => {
      this.subCategories = result;
      if (!this.FormVal?.SubCategoryID) {
        // this.registerForm.controls['SubCategoryID'].setValue(result[0]?.subCategoryID)
      }
      console.log(this.subCategories);
    })
  }

  onCategoryChange(eve: any): void {
    this.registerForm.controls['CategoryID'].setValue(eve.target.value)
    this.registerForm.controls['SubCategoryID'].setValue('');
    this.getSubCategories();
  }

  onSubCategoryChange(eve: any): void {
    this.registerForm.controls['SubCategoryID'].setValue(eve.target.value)
  }

  onFileChange(event: any) {
    this.fileUpload = event.target.files[0];
    console.log(this.fileUpload);

  }
  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.fileName = file.name; // Set the file name
      this.fileUpload = file;
      this.registerForm.patchValue({ image: file });
      this.registerForm.get('image')?.updateValueAndValidity();
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    const formData = new FormData();
    if (this.emailExists) {
      this.message = 'Email is already registered!';
      return;
    }
    // Append form data
    for (const key in this.registerForm.value) {
      if (this.registerForm.value.hasOwnProperty(key)) {
        formData.append(key, this.registerForm.value[key]);
      }
    }    
   
    // Append the file upload data
    formData.append('VisitingCard', this.fileUpload);
  
    // Call the business registration service
    this.businessService.registerBusiness(formData).subscribe({
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
        this.registerForm.reset();
        console.error('Registration error:', error);
      }
    });
  }
  
}
