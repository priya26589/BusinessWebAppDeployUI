import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerregistrationComponent } from './customerregistration.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CustomerregistrationComponent', () => {
  let component: CustomerregistrationComponent;
  let fixture: ComponentFixture<CustomerregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerregistrationComponent],
      imports: [CustomerregistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CustomerregistrationComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
