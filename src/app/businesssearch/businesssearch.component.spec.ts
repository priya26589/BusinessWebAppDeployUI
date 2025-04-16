import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BusinesssearchComponent } from './businesssearch.component';
import { BusinessService } from '../service/business.service';
import { HttpClientModule  } from '@angular/common/http';
fdescribe('BusinesssearchComponent', () => {
  let component: BusinesssearchComponent;
  let fixture: ComponentFixture<BusinesssearchComponent>;
  let buisnessService =jasmine.createSpyObj('BusinessService',['getCustomerDetailsByID']);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinesssearchComponent,HttpClientModule],
      providers: [{provide:BusinessService,useValue:buisnessService}] // Provide the BusinessService if used
    })
    .compileComponents(); 
    
    fixture = TestBed.createComponent(BusinesssearchComponent);
    component = fixture.componentInstance;
    buisnessService =TestBed.inject(BusinessService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('update pagination with values',()=>{
    component.businessList.length =100;
    component.itemsPerPage =10;
    component.updatePagination();
    expect(component.totalPages).toEqual(10);
    expect(component.isPaginationVisible).toEqual(true);
  })
  it('update pagination with no values',()=>{
    component.businessList.length =0;
    component.itemsPerPage =10;
    component.updatePagination();
    expect(component.totalPages).toEqual(0);
    expect(component.isPaginationVisible).toEqual(false);
  })
  it('pagination previous button disable if current page in one',()=>{
    component.currentPage =1;
    component.isPaginationVisible =true;
    fixture.detectChanges();
    const previouButton =fixture.debugElement.nativeElement.querySelector('#previous-button');
    expect(previouButton.disabled).toEqual(true);
  })
  it('pagination next button disable if current page is equal to total count',()=>{
    component.currentPage =1;
    component.isPaginationVisible =true;
    fixture.detectChanges();
    const previouButton =fixture.debugElement.nativeElement.querySelector('#next-button');
    expect(previouButton.disabled).toEqual(true);
  })
  it('pagination page display',()=>{
    component.currentPage =1;
    component.totalPages =10;
    component.isPaginationVisible =true;
    fixture.detectChanges();
    const pageDispaly =fixture.debugElement.nativeElement.querySelector('#page-display').textContent;
    expect(pageDispaly).toEqual('Page 1 of 10');
  })
  it('pagination call previous button',()=>{
    component.isPaginationVisible =true;
    component.currentPage = 10;
    fixture.detectChanges();
    spyOn(component,'previousPage');
    const previouButton = fixture.debugElement.nativeElement.querySelector('#previous-button');
    previouButton.click();
    expect(component.previousPage).toHaveBeenCalledTimes(1);
  })
  it('pagination call next button',()=>{
    component.isPaginationVisible =true;
    component.totalPages = 100;
    component.currentPage = 1;
    fixture.detectChanges();
    spyOn(component,'nextPage');
    const previouButton = fixture.debugElement.nativeElement.querySelector('#next-button');
    previouButton.click();
    expect(component.nextPage).toHaveBeenCalledTimes(1);
  })
  it('Customer Detail check service is called with right input',()=>{
    component.cusId =1;
    buisnessService.getCustomerDetailsByID(1);
    component.getCustomerDetails();
   expect(buisnessService.getCustomerDetailsByID).toHaveBeenCalledOnceWith(component.cusId);

  })
  it('Customer Detail call ',()=>{
    component.cusId =1;
    buisnessService.getCustomerDetailsByID(1).callFake((result:any) =>{
      component.customerData = result;
    }

    )
  });
});
