import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AddEmployeeComponent } from './add-employee/add-employee';
import { EmployeeListComponent } from './employee-list/employee-list';

//  Import Project Components
import { ProjectsComponent } from './projects/projects';
import { AddProjectComponent } from './add-projects/add-projects';

export const routes: Routes = [

  // Default redirect
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: LoginComponent },

  // Dashboard
  { path: 'dashboard', component: DashboardComponent },

  // EMPLOYEE ROUTES
  { path: 'employees', component: EmployeeListComponent },
  { path: 'add-employee', component: AddEmployeeComponent },

  // PROJECT ROUTES 
  { path: 'projects', component: ProjectsComponent },
  { path: 'add-project', component: AddProjectComponent },
  { path: '**', redirectTo: 'login' }
];
