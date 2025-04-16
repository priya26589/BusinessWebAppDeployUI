import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterbusinessComponent } from './registerbusiness.component';

describe('RegisterbusinessComponent', () => {
  let component: RegisterbusinessComponent;
  let fixture: ComponentFixture<RegisterbusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterbusinessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
