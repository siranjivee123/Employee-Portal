import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

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
    'date',
    'actions'   
  ];

  employees: any[] = [];
  filteredEmployees = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  selectedProject = '';
  selectedDate = '';
  sortOption: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.filteredEmployees.paginator = this.paginator;
  }

  // LOAD
  loadEmployees() {
    const data = JSON.parse(localStorage.getItem('employees') || '[]');
    this.employees = data;
    this.applyFilter();
  }

  // FILTER + SORT
  applyFilter() {

    const keyword = this.searchText.trim().toLowerCase();
    const projectKey = this.selectedProject.trim().toLowerCase();

    let result = this.employees.filter(emp => {

      const name = emp.name?.toLowerCase() || '';
      const email = emp.email?.toLowerCase() || '';

      const matchSearch =
        keyword === '' ||
        name.includes(keyword) ||
        email.includes(keyword);

      const matchProject =
        projectKey === ''
          ? true
          : (emp.projects || []).some((p: string) =>
              p.toLowerCase().includes(projectKey)
            );

      const matchDate =
        this.selectedDate
          ? new Date(emp.date).toISOString().split('T')[0] === this.selectedDate
          : true;

      return matchSearch && matchProject && matchDate;
    });

    this.filteredEmployees = new MatTableDataSource(result);
    this.filteredEmployees.paginator = this.paginator;
  }

  //  VIEW EMPLOYEE
  viewEmployee(emp: any) {
    Swal.fire({
      title: 'Employee Details',
      html: `
        <b>Name:</b> ${emp.name}<br>
        <b>Email:</b> ${emp.email}<br>
        <b>Projects:</b> ${(emp.projects || []).join(', ')}<br>
        <b>Tasks:</b> ${emp.tasks}<br>
        <b>Date:</b> ${emp.date}
      `,
      icon: 'info'
    });
  }

  //  EDIT EMPLOYEE
  editEmployee(emp: any) {
    this.router.navigate(['/add-employee'], {
      queryParams: { id: emp.id }
    });
  }

  // DELETE EMPLOYEE :
  deleteEmployee(id: string) {
    const updated = this.employees.filter(e => e.id !== id);
    localStorage.setItem('employees', JSON.stringify(updated));

    Swal.fire({
      icon: 'success',
      title: 'Deleted',
      text: 'Employee Removed successfully',
      timer: 1200,
      showConfirmButton: false
    });

    this.loadEmployees();
  }

  refresh() {
    this.loadEmployees();
  }
}
