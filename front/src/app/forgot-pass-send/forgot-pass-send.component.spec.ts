import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPassSendComponent } from './forgot-pass-send.component';

describe('ForgotPassSendComponent', () => {
  let component: ForgotPassSendComponent;
  let fixture: ComponentFixture<ForgotPassSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForgotPassSendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPassSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
