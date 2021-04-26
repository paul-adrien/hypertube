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
      <input formControlName="name" />
      <div class="custom-slider sort">
        <span>Trier par:</span>
        <select class="select" formControlName="sortBy">
          <option *ngFor="let option of this.sortOptions" [ngValue]="option.id">
            {{ option.name }}
          </option>
        </select>
      </div>
      <div class="custom-slider sort">
        <select class="select" formControlName="genre">
          <option *ngFor="let option of this.genreOptions">
            {{ option }}
          </option>
        </select>
      </div>
      <div class="custom-slider">
        <span>Note</span>
        <ngx-slider [options]="noteOptions" formControlName="note"></ngx-slider>
      </div>
      <div class="custom-slider">
        <span>Age</span>
        <ngx-slider [options]="ageOptions" formControlName="age"></ngx-slider>
      </div>

      <button class="primary-button">Filtrer</button>
    </form>
  `,
  styleUrls: ['./filter-and-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterAndSortComponent implements OnInit {
  @Input() public isSuggestion = false;
  @Output() public sendParams = new EventEmitter();

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  usersMatch = [];

  sortOptions = [
    { name: 'Aucun', id: '0' },
    { name: 'Age', id: 'age' },
    { name: 'Score de popularité', id: 'popu' },
    { name: 'Distance', id: 'local' },
    { name: 'Nombre de tags en commun', id: 'tags' },
  ];

  genreOptions = [
    'Aucun',
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

  sliderForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    age: new FormControl([18, 150]),
    note: new FormControl(0),
    sortBy: new FormControl('0'),
    genre: new FormControl('Aucun'),
  });

  ageOptions: Options = {
    floor: 18,
    ceil: 150,
    minRange: 4,
    hideLimitLabels: true,
  };

  noteOptions: Options = {
    floor: 0,
    ceil: 9,
    showSelectionBar: true,
  };

  localOptions: Options = {
    floor: 1,
    ceil: 4000,
    showSelectionBar: true,
  };

  tagsOptions: Options = {
    floor: 0,
    ceil: 100,
    showSelectionBar: true,
  };

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
