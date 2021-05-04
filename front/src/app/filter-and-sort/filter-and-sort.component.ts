import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-filter-and-sort',
  template: `
    <form
      class="form-container"
      [formGroup]="this.sliderForm"
      (ngSubmit)="f.form.valid && filtreUsersBy()"
      #f="ngForm"
      name="form"
      novalidate
    >
      <div class="input-button">
        <input formControlName="name" />
        <button [disabled]="this.disabledButton" class="primary-button">
          {{ 'search' | translate }}
        </button>
      </div>
      <div class="custom-slider sort">
        <select class="select" formControlName="genre">
          <option selected disabled hidden>Genre</option>
          <option *ngFor="let option of this.genreOptions">
            {{ option }}
          </option>
        </select>
        <select class="select" formControlName="note">
          <option selected disabled hidden>Note</option>
          <option *ngFor="let option of this.noteOptions">
            {{ option }}
          </option>
        </select>
        <select class="select" formControlName="sortBy">
          <option selected disabled hidden>Trier par</option>
          <option *ngFor="let option of this.sortOptions">
            {{ option }}
          </option>
        </select>

        <select class="select" formControlName="orderBy">
          <option selected disabled hidden>Ordre</option>
          <option *ngFor="let option of this.orderOptions">
            {{ option }}
          </option>
        </select>
      </div>
    </form>
  `,
  styleUrls: ['./filter-and-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterAndSortComponent implements OnInit {
  @Input() public isSuggestion = false;
  @Input() public disabledButton = false;
  @Output() public sendParams = new EventEmitter();

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  usersMatch = [];

  genreOptions = [
    'Tout',
    'Action',
    'Adventure',
    'Animation',
    'Biography',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'Film Noir',
    'History',
    'Horror',
    'Music',
    'Musical',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Short Film',
    'Sport',
    'Superhero',
    'Thriller',
    'War',
    'Western',
  ];

  public noteOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  public sortOptions = ['title', 'rating', 'year', 'download_count'];

  public orderOptions = ['asc', 'desc'];

  sliderForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    note: new FormControl('Note'),
    sortBy: new FormControl('Trier par'),
    orderBy: new FormControl('Ordre'),
    genre: new FormControl('Genre'),
  });

  ngOnInit(): void {
    if (!this.isSuggestion) {
      if (JSON.parse(localStorage.getItem('filter-params'))) {
        this.sliderForm.patchValue(
          JSON.parse(localStorage.getItem('filter-params'))
        );
      }
      // this.filtreUsersBy();
    }
  }

  filtreUsersBy() {
    console.log(this.sliderForm.getRawValue());
    this.sendParams.emit(this.sliderForm.getRawValue());
    // localStorage.setItem(
    //   'filter-params',
    //   JSON.stringify(this.sliderForm.getRawValue())
    // );
    // this.usersSort.emit(
    //   this.matchService.filtreUsersBy(
    //     JSON.parse(localStorage.getItem('id')),
    //     this.sliderForm.getRawValue(),
    //     this.isSuggestion
    //   )
    // );
  }
}
