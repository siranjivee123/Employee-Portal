import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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

  //  datasource usage:
  filteredEmployees = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  selectedProject = '';
  selectedDate = '';
  sortOption = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.filteredEmployees.paginator = this.paginator;
  }

  // LOAD DATA
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

    // Sorting :
    switch (this.sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    this.filteredEmployees = new MatTableDataSource(result);
    this.filteredEmployees.paginator = this.paginator;
  }

  // VIEW
 viewEmployee(emp: any) {
  Swal.fire({
    title: 'Employee Details',
    html: `
      <div style="text-align:left; font-size:14px;padding:10px; line-height:1.8">

        <table style="width:100%">
          <tr><td><b>Name</b></td><td>: ${emp.name}</td></tr>
          <tr><td><b>Email</b></td><td>: ${emp.email}</td></tr>
          <tr> <td><b>Projects</b></td><td>: ${(emp.projects || []).join(', ')}</td></tr> 
          <tr><td><b>Tasks</b></td><td>: ${emp.tasks}</td></tr>
          <tr><td><b>Date</b></td><td>: ${new Date(emp.date).toLocaleDateString()}</td></tr>
        </table>
      </div>
    `,
    icon: 'info',
    width: '450px'
  });
}
  // EDIT
  editEmployee(emp: any) {
    this.router.navigate(['/add-employee'], {
      queryParams: { id: emp.id }
    });
  }

  // DELETE
  deleteEmployee(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This Employee will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {

        const updated = this.employees.filter(e => e.id !== id);
        localStorage.setItem('employees', JSON.stringify(updated));

        this.loadEmployees();

        Swal.fire('Deleted!', 'Employee removed successfully', 'success');
      }
    });
  }

  refresh() {
    this.loadEmployees();
  }
}