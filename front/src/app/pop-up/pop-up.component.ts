import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pop-up',
  template: `
    <span class="title">{{ this.data?.title }}</span>
    <span class="message">{{ this.data?.message }}</span>
    <div
      *ngIf="!this.data?.two"
      (click)="this.closePopup(true)"
      class="primary-button"
    >
      {{ this.data?.button || "J'ai compris" }}
    </div>
    <div *ngIf="this.data?.two" class="buttons">
      <div
        *ngIf="this.data?.two"
        (click)="this.closePopup(false)"
        class="primary-button"
      >
        Non
      </div>
      <div
        *ngIf="this.data?.two"
        (click)="this.closePopup(true)"
        class="primary-button"
      >
        Oui
      </div>
    </div>
  `,
  styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopUpComponent>
  ) {}

  ngOnInit(): void {}

  public closePopup(res?: any) {
    this.dialogRef.close(res);
  }
}
