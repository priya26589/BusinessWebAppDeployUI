import { CommonModule } from '@angular/common';
import { Component, OnInit ,EventEmitter,Input,Output, Renderer2} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { BusinessService } from '../service/business.service';
import { GoogleMapsModule } from '@angular/google-maps';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
export interface Business {
  name: string;
  description: string;
  image: string;
  distanceKm: number;
}
@Component({
  selector: 'app-businesssearch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatTabsModule, GoogleMapsModule, FormsModule, HttpClientModule],
  providers: [BusinessService],
  templateUrl: './businesssearch.component.html',
  styleUrl: './businesssearch.component.css'
})
export class BusinesssearchComponent implements OnInit {
  title = 'starrating';
   rating: number = 0;
  maxStars: number = 5;
  @Output() ratingChange = new EventEmitter<number>();
   buisnessRating ={
    businessID : 0,
    rating:0,
    ratedBy:'',
    comment:''
    
   }
   buisnessRatingList:any;
   ratingErrorMessage =false;
  setRating(value: number): void {
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }
  searchForm !: FormGroup;
  categories: any[] = [];
  businessList: any[] = [];
  fileUpload: any;
  isTableVisible: boolean = false; // Table visibility flag

  imageBaseUrl = 'https://businessnewenvironment.onrender.com/';
  //imageBaseUrl = 'https://localhost:7000/uploads/';

  latitudeDifference: number | null = null;
  longitudeDifference: number | null = null;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 }; // Default to San Francisco
  zoom = 10;
  marker: google.maps.LatLngLiteral | null = null;

  // Variables to store selected category and subcategory objects
  selectedCategory: any = null;
  selectedSubCategory: any = null;
  selectedBusiness: any = null; // Initially null
  subCategories: any;
  businessDetail: any;
  newLocation: any;
  newLatitude: any;
  newLongtitude: any;
  distance: any;
  cusId: any;
  emailId:any;
  customerData: any;
  errorMessage: string | null = null;
  ratingComment:string='' ;
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of businesses per page
  totalPages: number = 1;
  isPaginationVisible: boolean = false;
  roleID: string | null = null;
  isModalOpen = false;
  modalImageUrl = '';
  distanceAscending:boolean = false;
  ratingAscending:boolean=false;
  constructor(private fb: FormBuilder, private businessService: BusinessService, private router: Router, private authservice: AuthService, private renderer: Renderer2) { }

  ngOnInit(): void {
 
    this.searchForm = this.fb.group({
      searchQuery: ['', Validators.required],
      category: ['', Validators.required],
      CategoryID: [0],  
      subcategory: ['', Validators.required],
      location: new FormControl('', [Validators.required]),
      Latitude: [8.3],
      Longitude: [9.3],
    });

    this.getCategories();
    this.getCurrentLocation();
    console.log(this.categories, "test")
    this.cusId = this.authservice.getEmailFromToken();
    this.emailId =this.authservice.getEmailIDFromToken()
    console.log('Cusid:', this.cusId);
    this.getCustomerDetails();
    this.roleID = this.authservice.getRoleIdFromToken();
    console.log("token", this.roleID)
  }

  openModal(imageUrl: string) {
    let filePath = this.selectedBusiness.visitingCard;
    if(filePath == null)
      {
        this.isModalOpen = false;
        alert('Image not found.');
      }
    let fileName = filePath.replace("uploads\\", "");
    if(fileName != null){
      this.modalImageUrl = imageUrl;
      this.isModalOpen = true; } else{
        alert('Image not found.');
      }   
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openPopup(business: any) {
    this.selectedBusiness = business;
    this.renderer.addClass(document.body, 'no-scroll'); // Lock scrolling
  }

  updatePagination(): void {
    // this.totalPages = Math.ceil(this.businessList.length / this.itemsPerPage);
    // this.isPaginationVisible = this.totalPages > 1; // Show pagination if multiple pages exist
    // Calculate total pages
  this.totalPages = Math.ceil(this.businessList.length / this.itemsPerPage);
  
  // Ensure pagination is visible only if more than one page exists
  this.isPaginationVisible = this.totalPages > 1;

  // Ensure the current page does not exceed total pages
  if (this.currentPage > this.totalPages) {
    this.currentPage = this.totalPages;
  }
  
  // Ensure current page is at least 1
  if (this.currentPage < 1) {
    this.currentPage = 1;
  }

  // // Calculate the start and end index for paginated data
  // const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  // const endIndex = startIndex + this.itemsPerPage;

  // // Slice the business list based on pagination
  // this.paginatedBusinesses = this.businessList.slice(startIndex, endIndex);
  }

  get paginatedBusinesses(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.businessList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.updatePagination();
  }
  
  goToLastPage() {
    this.currentPage = this.totalPages;
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
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

  getCustomerDetails() {
    this.businessService.getCustomerDetailsByID(this.cusId).subscribe({
      next: (data) => {
        this.customerData = data;
        localStorage.setItem('customerLatitude',data[0].latitude)
        localStorage.setItem('customerLongitude',data[0].longitude)
        this.errorMessage = null;
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
        this.customerData = null;
        this.errorMessage = 'Customer not found.';
      }
    });
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
    const location = this.selectedBusiness?.location;
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

  onCalculateBusiness(): void {
    if (this.selectedBusiness.latitude !== null && this.newLatitude !== null) {
      this.latitudeDifference = this.newLatitude - this.selectedBusiness.latitude;
    } else {
      this.latitudeDifference = null;
    }

    if (this.selectedBusiness.longitude !== null && this.newLongtitude !== null) {
      this.longitudeDifference = this.newLongtitude - this.selectedBusiness.longitude;
    } else {
      this.longitudeDifference = null;
    }
  }

  updateLocationFields(location: string, lat: number, lng: number): void {
    this.selectedBusiness.location = location
    this.selectedBusiness.longitude = lat
    this.selectedBusiness.latitude = lng
  }

  // Method to generate the full image URL
  getImageUrl(visitingCard: string): string {
    return `${this.imageBaseUrl}${visitingCard?.split("\\").pop()}`;
  }

  onCommentChange(event:any){
   this.ratingComment = event?.target?.value;
  }
  // Handle category selection
  selectCategory(category: any): void {
    this.selectedCategory = category; // Store the entire category object
    this.selectedSubCategory = null; // Reset subcategory when category changes
    this.getSubCategories(category?.categoryID);
  }

  // Handle subcategory selection
  selectSubcategory(subcategory: any): void {
    this.selectedSubCategory = subcategory; // Store the entire subcategory object
  }

  getSubCategories(id: any) {
    this.businessService.getSubCategories(id).subscribe((result: any) => {
      this.subCategories = result;
    })
  }

  getBusinessDetailById(id: any, distance: number) {
    this.businessService.getBusinessDetailById(id).subscribe((result: any) => {
      this.selectedBusiness = result[0];
      console.log(this.selectedBusiness, '-ppp');
      this.selectedBusiness.distancekm = distance;
    })
  }

  callSearch() {
    if (!this.selectedCategory) {
      alert('No category selected. Please choose a category.');
      return;
    }

    // Check if a category is selected
    if (!this.selectedSubCategory) {
      alert('No subcategory selected. Please choose a subcategory.');
      return;
    }
    this.businessService.searchBusinesses(this.selectedCategory.categoryName, this.selectedSubCategory.subCategoryName).subscribe((result: any) => {
      this.businessList = result;
      this.updateDistance();
      this.updatePagination();
      this.isTableVisible = true;      
    })
  }
  updateDistance(){
    let customerLatitude = localStorage.getItem('customerLatitude')
    let customerLongitude = localStorage.getItem('customerLongitude')
    // Array to hold all distance fetch Promises
    let distancePromises = this.businessList.map((item: any) => {
      return new Promise((resolve) => {
        this.businessService.getDistance(customerLatitude,customerLongitude,item.latitude,item.longitude)
          .subscribe((response: any) => {
            let distance = response.rows[0].elements[0].distance.text;
            item.distancekm = parseFloat(distance).toFixed(2);
            resolve(item);  // Resolve the Promise when distance is assigned
          },
          (error: any) => {
            if(error.error.message == 'Plan not found'){
              console.log('change distance api key');
            }
          });
      });
    });
    // Wait for all distance assignments to finish
    Promise.all(distancePromises).then(() => {
      // After all distances are assigned, sort the businessList by distancekm
      this.businessList.sort((a: any, b: any) => {
        return parseFloat(a.distancekm) - parseFloat(b.distancekm);
      });
    });
}
  replacePercentage(val: any) {
    console.log(val);
    return val;
  }

  get FormVal() {
    return this.searchForm.value
  }


  getCategories(): void {
    this.businessService.getCategories().subscribe((data) => {
      this.categories = data;
      if (!this.FormVal?.CategoryID) {
        this.searchForm.controls['CategoryID'].setValue(data[0]?.categoryID)
      }
    });
  }


  // Handle form submission
  onSubmit(): void {
    if (this.searchForm.valid) {
      console.log('Form Submitted:', this.searchForm.value);
    } else {
      console.error('Form is invalid');
    }
  }
  sortDistance(value:boolean):any{
   if(value && this.businessList.length>0){
    this.businessList =this.businessList?.sort((a,b)=>a.distancekm-b.distancekm);
   }else{
    this.businessList =this.businessList?.sort((a,b)=>b.distancekm-a.distancekm);
   }
  }
  sortRating(value:boolean):any{
    if(value && this.businessList.length>0){
      this.businessList =this.businessList?.sort((a,b)=>a.averageRating-b.averageRating);
     }else{
      this.businessList =this.businessList?.sort((a,b)=>b.averageRating-a.averageRating);
     }
  }
  // View business details when a name is clicked
  viewBusinessDetails(business: any): void {
    this.selectedBusiness = business;
  }

  // Open popup with selected business details
  // openPopup(business: any): void {
  //   this.selectedBusiness = business;
  // }

  // Close the popup
  closePopup(): void {
    this.selectedBusiness = null;
    this.rating=0;
    this.ratingComment = '';
    this.selectedBusiness = null;
    this.renderer.removeClass(document.body, 'no-scroll'); // Enable scrolling
  }
  
  getRating(buisnessId:any){
    this.businessService.getBusinessRating(buisnessId).subscribe(result=>{
      this.buisnessRatingList = result;
    }) ;
  }

  clearRating(){
    this.rating=0;
    this.ratingComment = '';
  }
  submitRating(comments:any){
    this.ratingErrorMessage = false;

   this.buisnessRating.businessID =comments.businessID;
   this.buisnessRating.comment =this.ratingComment;
   this.buisnessRating.rating =this.rating;
   this.buisnessRating.ratedBy =this.emailId;
   if(this.rating <= 0){
    this.ratingErrorMessage = true;
    return ;
   }
  this.businessService.addBusinessRating(this.buisnessRating ).subscribe({
    next:(result) =>{
  
      this.buisnessRating.businessID =0;
      this.buisnessRating.comment ='';
      this.buisnessRating.rating =0;
      this.buisnessRating.ratedBy = '';
      this.ratingComment ='';
      this.rating =0;
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Successfully updated!',
        confirmButtonText: 'OK',
      });
    
    this.getRating(comments.businessID);
    this.callSearch();
   },error:(error:any)=>{
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.error,
      confirmButtonText: 'Close',
    });
  }
   });

  }
 
  submitBusiness(distance: any) {
    const formData = new FormData();

    Object.keys(this.selectedBusiness).forEach((key) => {
      if (key === 'image') {
        // Append the file separately
        formData.append(key, this.selectedBusiness[key], this.selectedBusiness[key].name);
      } else {
        // Append other fields
        formData.append(key, this.selectedBusiness[key]);
      }
    });

    // Call the business registration service
    this.businessService.updateBusiness(formData).subscribe({
      next: (response: any) => {
        if (response) {
          // Show success popup using SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Successfully updated!',
            confirmButtonText: 'OK',
          });

          //this.registerForm.reset();
          this.router.navigateByUrl('/login');
        } else {
          // Show failure popup using SweetAlert2
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'update failed!',
            confirmButtonText: 'Try Again',
          });
        }
      },
      error: (error: any) => {
        // Handle errors during registration
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred during registration. Please try again.',
          confirmButtonText: 'Close',
        });
        this.searchForm.reset();
        console.error('update error:', error);
      }
    });
  }

  toggleSortDistance() {
    this.distanceAscending = !this.distanceAscending;
    this.sortDistance(this.distanceAscending);
  }

  toggleSortRating()
  {
    this.ratingAscending = !this.ratingAscending;
    this.sortRating(this.ratingAscending);
  }
}
