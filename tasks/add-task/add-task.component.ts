import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {

  taskForm!: FormGroup;
  editId: any = null;
  projectList: string[] = [];
  assignedByList: string[] = ['Manager 1', 'Manager 2', 'Admin'];

  constructor(
     private fb: FormBuilder,
     public router: Router,
     private route: ActivatedRoute) {}

  ngOnInit() {
    this.taskForm = this.fb.group({
      ticket: ['', Validators.required],
      description: ['', Validators.required],
      project: ['', Validators.required],
      shift: ['', Validators.required],
      assignedBy: ['', Validators.required],
      effort: ['', Validators.required],
      date: ['', Validators.required]
    });

    this.loadProjects();
  
  // CHECK EDIT MODE
  this.route.queryParams.subscribe(params => {
    if (params['id']) {
      this.editId = params['id'];
      this.loadTaskById(this.editId);
    }
  });
}
  // Load Projects
  loadProjects() {
    const data = JSON.parse(localStorage.getItem('projects') || '[]');
    this.projectList = data.map((p: any) => p.name);
  }

  // Load Task from Edit
  loadTaskById(id: any) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const task = tasks.find((t: any) => t.id == id);

  if (task) {
    this.taskForm.patchValue(task);
  }
}
  // Submit Task
  onSubmit() {
  if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched();
    return;
  }

  let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  if (this.editId) {
// UPDATE EXISTING
    tasks = tasks.map((t: any) => {
      if (t.id == this.editId) {
        return { ...t, ...this.taskForm.value };
      }
      return t;
    });

    Swal.fire('Updated!', 'Task updated successfully', 'success');

  } else {
    // ADD NEW
    tasks.push({
      id: Date.now(),
      ...this.taskForm.value
    });

    Swal.fire('Success', 'Task Added Successfully!', 'success');
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));

  this.router.navigate(['/dashboard'], {
    queryParams: { view: 'tasks' }
  });
}
  // Cancel Button
  goBack() {
    this.router.navigate(['/dashboard'], {
      queryParams: { view: 'tasks' }
    });
  }
}
