import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

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

  // ---------------- TABLE COLUMNS ----------------
  displayedColumns: string[] = [
    'sno',
    'id',
    'name',
    'projects',
    'tasks',
    'email',
    'date',
    'actions'
  ];

  employees: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ---------------- FILTERS ----------------
  searchText = '';
  selectedProject = '';
  selectedDate = '';
  sortOption = '';

  // ---------------- ROLE ----------------
  role: string = '';

  // ---------------- POPUP ----------------
  showPopup = false;
  selectedEmployee: any = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.getRoleFromToken();
  }

  // ================= INIT =================
  ngOnInit() {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // ================= ROLE =================
  getRoleFromToken() {
    const token = localStorage.getItem('token');

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.role = payload.role;
    }
  }

  // ================= LOAD DATA =================
  loadEmployees() {
    this.http.get<any[]>('http://localhost:5000/api/employees')
      .subscribe({
        next: (res) => {
          this.employees = res;
          this.dataSource.data = res;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // ================= FILTER + SORT =================
  applyFilter() {

    const keyword = this.searchText.trim().toLowerCase();
    const projectKey = this.selectedProject.trim().toLowerCase();

    let result = this.employees.filter(emp => {

      const name = emp.name?.toLowerCase() || '';
      const email = emp.email?.toLowerCase() || '';

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        email.includes(keyword);

      const matchProject =
        !projectKey ||
        (emp.projects || []).some((p: string) =>
          p.toLowerCase().includes(projectKey)
        );

      const matchDate =
        !this.selectedDate ||
        new Date(emp.date).toISOString().split('T')[0] === this.selectedDate;

      return matchSearch && matchProject && matchDate;
    });

    // SORTING
    switch (this.sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'project-asc':
        result.sort((a, b) =>
          (a.projects?.[0] || '').localeCompare(b.projects?.[0] || '')
        );
        break;

      case 'project-desc':
        result.sort((a, b) =>
          (b.projects?.[0] || '').localeCompare(a.projects?.[0] || '')
        );
        break;
    }

    this.dataSource.data = result;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // ================= VIEW =================
  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  // ================= EDIT (ADMIN ONLY) =================
  editEmployee(emp: any) {
    if (this.role !== 'admin') return;

    this.router.navigate(['/add-employee'], {
      queryParams: { id: emp.id }
    });
  }

  // ================= DELETE (ADMIN ONLY) =================
  deleteEmployee(id: string) {

    if (this.role !== 'admin') return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Employee will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete'
    }).then(result => {

      if (result.isConfirmed) {

        this.http.delete(`http://localhost:5000/api/employees/${id}`)
          .subscribe(() => {

            this.loadEmployees();

            Swal.fire(
              'Deleted!',
              'Employee removed successfully',
              'success'
            );
          });
      }
    });
  }

  // ================= REFRESH =================
  refresh() {
    this.loadEmployees();
  }
}
