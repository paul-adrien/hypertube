import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPassChangeComponent } from './forgot-pass-change.component';

describe('ForgotPassChangeComponent', () => {
  let component: ForgotPassChangeComponent;
  let fixture: ComponentFixture<ForgotPassChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForgotPassChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPassChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
