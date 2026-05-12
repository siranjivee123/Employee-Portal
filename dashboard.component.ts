import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EmployeeListComponent } from '../employee-list/employee-list';
import { ProjectsComponent } from '../projects/projects';
import { TaskListComponent } from '../tasks/task-list/task-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EmployeeListComponent,
    ProjectsComponent,
    TaskListComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  isSidebarOpen = false;
  activeView: string = 'dashboard';

  role: string = '';

  menuItems: any[] = [];

  allMenuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      view: 'dashboard',
      roles: ['admin', 'manager', 'employee']
    },
    {
      label: 'Employees',
      icon: 'people',
      view: 'employees',
      roles: ['admin']
    },
    {
      label: 'Projects',
      icon: 'settings',
      view: 'projects',
      roles: ['admin']
    },
    {
      label: 'Tasks',
      icon: 'assignment',
      view: 'tasks',
      roles: ['admin', 'manager', 'employee']
    },
    {
      label: 'Leave Management',
      icon: 'event',
      view: 'leave',
      roles: ['admin', 'manager', 'employee']
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    // GET ROLE FROM LOGIN
    this.role = (localStorage.getItem('role') || '').toLowerCase();

    // FILTER MENU BASED ON ROLE
    this.menuItems = this.allMenuItems.filter(item =>
      item.roles.includes(this.role)
    );

    // KEEP YOUR EXISTING VIEW SYSTEM
    this.route.queryParams.subscribe(params => {
      this.activeView = params['view'] || 'dashboard';
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  setView(view: string) {
    this.router.navigate(['/dashboard'], { queryParams: { view } });
    this.isSidebarOpen = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
