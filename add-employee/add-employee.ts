import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { EmployeeSuccessDialogComponent } from './employee-success-dialog/employee-success-dialog.component';

import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './add-employee.html',
  styleUrls: ['./add-employee.css']
})
export class AddEmployeeComponent implements OnInit {

  basicForm!: FormGroup;
  techForm!: FormGroup;

  states: any[] = [];
  cities: any[] = [];

  roles: string[] = ['Developer', 'Tester', 'Manager', 'HR', 'Admin'];

  projectsList: string[] = [
    'Sign up page',
    'Employee page',
    'Login page',
    'Profile page'
  ];

  managersList: string[] = ['Arun', 'Vinoth', 'Rahul', 'Ram'];

  isLoadingCities = false;
  cityError = '';
  employeeId = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {

// STEP 1 FORM
    this.basicForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });

// STEP 2 FORM
    this.techForm = this.fb.group({
      role: ['', Validators.required],
      shift: ['', Validators.required],
      projects: [[], Validators.required],
      managers: [[], Validators.required],
    });

// LOAD STATES
    this.http.get<any>('https://countriesnow.space/api/v0.1/countries/states')
      .subscribe(res => {
        const india = res.data.find((c: any) => c.name === 'India');
        this.states = india?.states || [];
      });
  }

// NEXT STEP VALIDATION
  goNext(stepper: any) {

    if (this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return;
    }

    stepper.next();
  }

// STATE to  CITY
  onStateChange() {

    const selectedState = this.basicForm.get('state')?.value;

    this.basicForm.patchValue({ city: '' });
    this.cities = [];

    if (!selectedState) return;

    this.isLoadingCities = true;

    this.http.post<any>(
      'https://countriesnow.space/api/v0.1/countries/state/cities',
      {
        country: 'India',
        state: selectedState
      }
    ).subscribe({
      next: (res) => {
        this.cities = res.data || [];
        this.isLoadingCities = false;
      },
      error: () => {
        this.cityError = 'Unable to load cities';
        this.isLoadingCities = false;
      }
    });
  }

// SUBMIT
  onSubmit() {

    if (this.techForm.invalid) {
      this.techForm.markAllAsTouched();
      return;
    }

    const employees = JSON.parse(localStorage.getItem('employees') || '[]');

    this.employeeId = this.generateId();

    employees.unshift({
      id: this.employeeId,
      ...this.basicForm.value,
      ...this.techForm.value,
      date: new Date().toISOString(),
      tasks: Math.floor(Math.random() * 100)
    });

    localStorage.setItem('employees', JSON.stringify(employees));

    this.openSuccessDialog();
  }

// GENERATE ID
  generateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

// POPUP
  openSuccessDialog() {

    const dialogRef = this.dialog.open(EmployeeSuccessDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        employeeId: this.employeeId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'navigate') {
        this.router.navigate(['/dashboard'], {
          queryParams: { view: 'employees' }
        });
      }
    });
  }

  goToList() {
    this.router.navigate(['/dashboard'], {
      queryParams: { view: 'employees' }
    });
  }
}
