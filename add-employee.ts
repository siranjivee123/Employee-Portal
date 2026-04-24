import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClientModule, HttpClient } from '@angular/common/http';

//MAterial imports:
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './add-employee.html',
  styleUrls: ['./add-employee.css']
})
export class AddEmployeeComponent implements OnInit {

  states: any[] = [];
  cities: any[] = [];

  roles: string[] = ['Developer', 'Tester', 'Manager', 'HR', 'Admin'];

  projectsList: string[] = [
    'Sign up page',
    'Employee page',
    'Login page',
    'Profile page'
  ];

  managersList: string[] = [
    'Arun',
    'Vinoth',
    'Rahul',
    'Ram'
  ];

  employeeForm!: FormGroup;

  isLoadingCities = false;
  cityError = '';
  private cityTimeout: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

  // AUTO GENERATE ID:

  generateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // INIT:
  ngOnInit() {

    this.employeeForm = this.fb.group({
      id: [this.generateId()],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      role: ['', Validators.required],
      projects: [[], Validators.required],
      managers: [[], Validators.required],
    });

    this.http.get<any>('https://countriesnow.space/api/v0.1/countries/states')
      .subscribe(res => {
        const india = res.data.find((c: any) => c.name === 'India');
        this.states = india?.states || [];
      });
  }

  // STATE  CITIES:
  onStateChange() {

    clearTimeout(this.cityTimeout);

    this.cityTimeout = setTimeout(() => {
      const selectedState = this.employeeForm.get('state')?.value;
      this.employeeForm.patchValue({ city: '' });
      this.cities = [];
      if (!selectedState) return;
      this.isLoadingCities = true;
      this.cityError = '';
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

    }, 200);
  }

  // SUBMIT:

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    employees.push({
      ...this.employeeForm.value,
      date: new Date().toISOString(),
      tasks: Math.floor(Math.random() * 100)
    });
    localStorage.setItem('employees', JSON.stringify(employees));
    Swal.fire({
      icon: 'success',
      title: 'Employee Added!',
      text: 'Saved successfully',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/dashboard'], {
        queryParams: { view: 'employees' }
      });
    });
  }
  // BACK:
  goBack() {
    this.router.navigate(['/dashboard'], {
      queryParams: { view: 'employees' }
    });
  }
}