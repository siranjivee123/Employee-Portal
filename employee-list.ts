import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    MatPaginatorModule
  ],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'id',
    'name',
    'projects',
    'tasks',
    'email',
    'date'
  ];

  employees: any[] = [];

  filteredEmployees = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  selectedProject = '';
  selectedDate = '';
  sortOption: string = '';

  ngOnInit() {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.filteredEmployees.paginator = this.paginator;
  }

  loadEmployees() {
    const data = JSON.parse(localStorage.getItem('employees') || '[]');

    this.employees = data;
    this.applyFilter();
  }

  applyFilter() {

    const keyword = this.searchText.trim().toLowerCase();
    const projectKey = this.selectedProject.trim().toLowerCase();

    let result = this.employees.filter(emp => {

      const name = emp.name?.toLowerCase() || '';
      const email = emp.email?.toLowerCase() || '';

      // SEARCH (name/email)
      const matchSearch =
        keyword === '' ||
        name.includes(keyword) ||
        email.includes(keyword);

      // SEARCH (project)
      const matchProject =
        projectKey === ''
          ? true
          : (emp.projects || []).some((p: string) =>
              p.toLowerCase().includes(projectKey)
            );

      // DATE filter (FIXED)
      const matchDate =
        this.selectedDate
          ? new Date(emp.date).toISOString().split('T')[0] === this.selectedDate
          : true;

      // IMPORTANT: RETURN CONDITION
      return matchSearch && matchProject && matchDate;
    });

    // SORTING LOGIC
    switch (this.sortOption) {

      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'project-asc':
        result.sort((a, b) => {
          const aProjects = (a.projects || []).join(', ').toLowerCase();
          const bProjects = (b.projects || []).join(', ').toLowerCase();
          return aProjects.localeCompare(bProjects);
        });
        break;

      case 'project-desc':
        result.sort((a, b) => {
          const aProjects = (a.projects || []).join(', ').toLowerCase();
          const bProjects = (b.projects || []).join(', ').toLowerCase();
          return bProjects.localeCompare(aProjects);
        });
        break;
    }

    // APPLY DATA + PAGINATION
    this.filteredEmployees = new MatTableDataSource(result);
    this.filteredEmployees.paginator = this.paginator;
  }

  refresh() {
    this.loadEmployees();
  }
}
