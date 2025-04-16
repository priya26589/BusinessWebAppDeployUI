import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BusinessService } from '../service/business.service';
import { GoogleMapsModule } from '@angular/google-maps';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [ReactiveFormsModule,RouterOutlet, RouterLink, HttpClientModule, CommonModule,GoogleMapsModule],
  providers:[BusinessService],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent {
  roleID : any;
  domainID : any;
  emailID : any;
  businessDetails: any;
  customerDetails: any;
  editBusinessForm!: FormGroup;
  editCustomerForm!: FormGroup;
  categories: any;
  subCategories: any;
  categoryID: any;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 }; // Default to San Francisco
  zoom = 10;
  marker: google.maps.LatLngLiteral | null = null;
  fileName: string | undefined;
  imagePreview: string | undefined;
  fileUpload: any;
  emailExists: boolean = false;
  constructor(private fb: FormBuilder, private businessService: BusinessService,private router: Router) {
   
  }

  ngOnInit() {
    // this.getCurrentLocation();
    this.roleID = Number(localStorage.getItem('roleId'));
    this.domainID = Number(localStorage.getItem('domainID'));
  
    if (this.roleID === 3) {
      this.editBusinessForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        emailId: ['', [Validators.required, Validators.email]],
        description: ['', [Validators.required, Validators.maxLength(500)]],
        categoryID: ['', [Validators.required]],
        subCategoryID: ['', [Validators.required]],
        location: ['',[Validators.required]],
        // Password: ['', [Validators.required, Validators.minLength(6)]]
      });
      this.getCategories();
      this.getDetailsByID(this.roleID, this.domainID);
    } else if (this.roleID === 4) {
      this.editCustomerForm = this.fb.group({
        cus_Location: ['', [Validators.required, Validators.minLength(3)]],
        cus_EmailId: ['', [Validators.required, Validators.email]]
      });
  
      this.getDetailsByID(this.roleID, this.domainID);
    }
  }
  
  

  submitBusinessForm() {
    if (this.editBusinessForm.valid) {
      const formData = new FormData();

      for (const key in this.editBusinessForm.value) {
        if (this.editBusinessForm.value.hasOwnProperty(key)) {
          formData.append(key, this.editBusinessForm.value[key]);
        }
      }   
      formData.append('businessID', this.domainID);  
      this.businessService.updateBusinessDetails(formData).subscribe({
            next: (response) => {
              if (response) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Details Updated Successfully',
                  confirmButtonText: 'OK',
                });
        
                //this.registerForm.reset();
                this.router.navigateByUrl('/login');
              } else {
                // Show failure popup using SweetAlert2
                Swal.fire({
                  icon: 'error',
                  title: 'Failed',
                  text: 'Details Update failed!',
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
              console.error('Registration error:', error);
            }
          });
        }
      }

  submitCustomerForm()  {
    if (this.editCustomerForm.valid) {
      const formData = new FormData();

      for (const key in this.editCustomerForm.value) {
        if (this.editCustomerForm.value.hasOwnProperty(key)) {
          formData.append(key, this.editCustomerForm.value[key]);
        }
      }   
      formData.append('cus_Id', this.domainID);  
      this.businessService.updateCustomerDetails(formData).subscribe({
            next: (response) => {
              if (response) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Details Updated Successfully',
                  confirmButtonText: 'OK',
                });
        
                //this.registerForm.reset();
                this.router.navigateByUrl('/login');
              } else {
                // Show failure popup using SweetAlert2
                Swal.fire({
                  icon: 'error',
                  title: 'Failed',
                  text: 'Details Update failed!',
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
              console.error('Registration error:', error);
            }
          });
        }
      }
  
  getDetailsByID(roleID: number, domainID: number) {
    if (roleID === 3) {
      this.businessService.getBusinessDetailById(domainID).subscribe((data) => {
        this.businessDetails = data;
        const categoryID = this.businessDetails[0].categoryID || ''; // Get category ID
        const subCategoryID = this.businessDetails[0].subCategoryID || '';
        // Ensure data exists before patching
        if (this.businessDetails && this.editBusinessForm) {
          this.editBusinessForm.patchValue({
            name: this.businessDetails[0].name  || '',
            emailId: this.businessDetails[0].emailId || '',
            description: this.businessDetails[0].description || '',
            location: this.businessDetails[0].location || '',
            categoryID: categoryID,
            subCategoryID: ''
          });
            if (this.businessDetails[0].latitude && this.businessDetails[0].longitude) {
              this.center = { lat: this.businessDetails[0].latitude, lng: this.businessDetails[0].longitude };
              this.marker = { ...this.center };
            }
          this.getSubCategories(categoryID, subCategoryID);
        }
      });
    } else if (roleID === 4) {
      this.businessService.getCustomerDetailsByID(domainID).subscribe((data) => {
        this.customerDetails = data;
  
        if (this.customerDetails && this.editCustomerForm) {
          this.editCustomerForm.patchValue({
            cus_Location: this.customerDetails[0].cus_Location || '',
            cus_EmailId: this.customerDetails[0].cus_EmailId || ''
            // location: this.customerDetails.location || ''
          });
          if (this.customerDetails[0].latitude && this.customerDetails[0].longitude) {
            this.center = { lat: this.customerDetails[0].latitude, lng: this.customerDetails[0].longitude };
            this.marker = { ...this.center };
          }
        }
      });
    }
  }
  
  
  getCategories(): void {
    this.businessService.getCategories().subscribe((data) => {
      this.categories = data;
      const selectedCategoryID = this.editBusinessForm?.controls['categoryID'].value;
      if (selectedCategoryID) {
        this.getSubCategories(selectedCategoryID, this.editBusinessForm?.controls['subCategoryID'].value);
      }
    });
  }
  

  getSubCategories(categoryID: number, subCategoryID?: number) {
    this.businessService.getSubCategories(categoryID).subscribe((result: any) => {
      this.subCategories = result;
  
      if (subCategoryID) {
        const foundSubCategory = this.subCategories.find((sub: any) => sub.subCategoryID === subCategoryID);
        if (foundSubCategory) {
          this.editBusinessForm.controls['subCategoryID'].setValue(subCategoryID);
        }
      }
    });
  }
  

  onCategoryChange(eve: any): void {
    const selectedCategoryID = Number(eve.target.value);
    this.editBusinessForm.controls['categoryID'].setValue(selectedCategoryID);
    this.editBusinessForm.controls['subCategoryID'].setValue('');
    this.getSubCategories(selectedCategoryID);
  }
  

   onSubCategoryChange(eve: any): void {
     this.editBusinessForm.controls['subCategoryID'].setValue(eve.target.value)
   }

   get FormVal() {
    return this.editBusinessForm.value
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.marker = { lat, lng };
      this.getLocationName(lat, lng); // Fetch and set the location name
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
    if (this.roleID === 3) {
      this.editBusinessForm.patchValue({
        location: location,
        Latitude: lat,
        Longitude: lng
      });
    } else if (this.roleID === 4) {
      this.editCustomerForm.patchValue({
        cus_Location: location
      });
    }
  }
  

  onLocationInput(): void {
    const location = this.editBusinessForm.controls['location'].value;
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

  checkEmail() {
    const email = this.editBusinessForm.get('emailId')?.value;
    const presentEmail = localStorage.getItem("email");
    if (email != presentEmail) {
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
  getCurrentLocation(): void {
    if (!this.marker) { // Prevent overriding API location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            this.center = { lat, lng };
            this.marker = { ...this.center };
            this.getLocationName(lat, lng);
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
  }
  
}
