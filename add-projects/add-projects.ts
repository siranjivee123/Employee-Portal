import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './add-projects.html',
  styleUrls: ['./add-projects.css']
})
export class AddProjectComponent implements OnInit {

  projectForm!: FormGroup;
  editId: string | null = null;

  managersList = ['Manager1', 'Manager2'];
  employeesList = ['Emp1', 'Emp2'];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      manager: [[], Validators.required],
      employees: [[], Validators.required],
      status: ['', Validators.required],
      date: ['', Validators.required]
    });

    // Check edit mode
    this.editId = this.route.snapshot.queryParamMap.get('id');

    if (this.editId) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === this.editId);
      if (project) {
        this.projectForm.patchValue(project);
      }
    }
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    let projects = JSON.parse(localStorage.getItem('projects') || '[]');

    if (this.editId) {
  // Update project
      projects = projects.map((p: any) =>
        p.id === this.editId
          ? { ...this.projectForm.value, id: this.editId }
          : p
      );
    } else {
  // Add new project
      const newProject = {
        ...this.projectForm.value,
        id: Math.random().toString(36).substring(2, 10)
      };
      projects.unshift(newProject);
    }

    localStorage.setItem('projects', JSON.stringify(projects));

    // Success popup
    Swal.fire({
         icon: 'success',
         title: 'Projects Added!',
         text: 'Saved successfully',
         timer: 1500,
         showConfirmButton: false
       }).then(() => {
         this.router.navigate(['/dashboard'], {
           queryParams: { view: 'projects' }
         });
       });
     }
     // BACK:
     goBack() {
       this.router.navigate(['/dashboard'], {
         queryParams: { view: 'projects' }
       });
     }
   }