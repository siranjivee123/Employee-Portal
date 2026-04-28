import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddEmployeeComponent } from './add-employee/add-employee';
import { EmployeeListComponent } from './employee-list/employee-list';

// Project Components
import { ProjectsComponent } from './projects/projects';
import { AddProjectComponent } from './add-projects/add-projects';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { AddTaskComponent } from './tasks/add-task/add-task.component';

export const routes: Routes = [

  //  redirect
  { path: '', redirectTo: 'login', pathMatch: 'full' },

//Login
  { path: 'login', component: LoginComponent },

// Dashboard
  { path: 'dashboard', component: DashboardComponent },

// EMPLOYEE ROUTES
  { path: 'employees', component: EmployeeListComponent },
  { path: 'add-employee', component: AddEmployeeComponent },

 // PROJECT ROUTES 
  { path: 'projects', component: ProjectsComponent },
  { path: 'add-project', component: AddProjectComponent },

// TASK ROUTES 
  { path: 'tasks', component: TaskListComponent },
  { path: 'add-task', component: AddTaskComponent },

  { path: '**', redirectTo: 'login' }
];
