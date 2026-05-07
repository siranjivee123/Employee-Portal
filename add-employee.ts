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

  selectedFile: File | null = null;
  imagePreview: any;
  savedEmployee: any;   
  employeeId: string | null = null;

  isSubmitting = false;

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

  //  FILE UPLOAD 
  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // NEXT STEP
  goNext(stepper: any) {
    if (this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return;
    }
    stepper.next();
  }

  // STATE → CITY
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

console.log("SUBMIT CLICKED");

  if (this.techForm.invalid) {
    this.techForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;

  const formData = new FormData();

  const data = {
    ...this.basicForm.value,
    ...this.techForm.value
  };

  // append normal fields
  Object.keys(data).forEach(key => {
    const value = data[key];

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  // image
  if (this.selectedFile) {
    formData.append('profileImage', this.selectedFile);
  }
  console.log("FORM DATA:", data);
console.log("FILE:", this.selectedFile);

  this.http.post('http://localhost:5000/api/employee/add', formData)
    .subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        console.log("SUCCESS:", res); 

        this.employeeId = res.employee?._id || res.data?._id;
        this.savedEmployee = res.employee || res.data;

        this.openSuccessDialog();
      },
      error: (err) => {
  this.isSubmitting = false;
  console.error("Backend Error:", err);

  // Show proper backend message
  const message = err?.error?.message || "Error saving employee";
  alert(message);
}
    });

  }
  // SUCCESS POPUP
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
        this.router.navigate(['/dashboard/employees']);
      }
    });
  }

  goToList() {
    this.router.navigate(['/dashboard/employees']);
  }
}
