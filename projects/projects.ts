import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    MatPaginatorModule,
    DatePipe
  ],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css']
})
export class ProjectsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'name',
    'description',
    'category',
    'manager',
    'employees',
    'date',
    'actions'
  ];

  projects: any[] = [];

  filteredProjects = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  selectedCategory = '';
  selectedDate = '';
  sortOption: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.filteredProjects.paginator = this.paginator;
  }

  // LOAD DATA:
  loadProjects() {
    const data = JSON.parse(localStorage.getItem('projects') || '[]');

    this.projects = data;
    this.applyFilter();
  }

  //  FILTER & SORT
  applyFilter() {

    const keyword = this.searchText.trim().toLowerCase();
    const categoryKey = this.selectedCategory.trim().toLowerCase();

    let result = this.projects.filter(p => {

      const name = p.name?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';

  // SEARCH (name/description)
      const matchSearch =
        keyword === '' ||
        name.includes(keyword) ||
        desc.includes(keyword);

  // CATEGORY filter
      const matchCategory =
        categoryKey === '' ||
        category.includes(categoryKey);

  // DATE filter
      const matchDate =
        this.selectedDate
          ? new Date(p.date).toISOString().split('T')[0] === this.selectedDate
          : true;

      return matchSearch && matchCategory && matchDate;
    });

   // SORTING
    switch (this.sortOption) {

      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'category-asc':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;

      case 'category-desc':
        result.sort((a, b) => b.category.localeCompare(a.category));
        break;
    }

  // APPLY DATA + PAGINATION
    this.filteredProjects = new MatTableDataSource(result);
    this.filteredProjects.paginator = this.paginator;
  }

  //  VIEW
  viewProject(p: any) {
  Swal.fire({
    title: 'Project Details',
    html: `
      <div style="text-align:left; font-size:14px; line-height:1.8">
        <table style="width:100%; border-collapse:collapse">

          <tr><td><b>Name</b></td><td>: ${p.name}</td></tr>
          <tr><td><b>Description</b></td><td>: ${p.description}</td></tr>
          <tr><td><b>Category</b></td><td>: ${p.category}</td></tr> 
          <tr><td><b>Manager</b></td><td>: ${Array.isArray(p.manager) ? p.manager.join(', ') : p.manager}</td></tr>
          <tr><td><b>Employees</b></td> <td>: ${(p.employees || []).join(', ')}</td></tr>
          <tr><td><b>Date</b></td><td>: ${new Date(p.date).toLocaleDateString()}</td> </tr>
        </table>
      </div>
    `,
    icon: 'info',
    width: '450px',
    confirmButtonText: 'Close'
  });
}
  // EDIT
  editProject(p: any) {
    this.router.navigate(['/add-project'], 
      { queryParams: { id: p.id } });
  }

  //  DELETE
  deleteProject(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This project will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {

        const updated = this.projects.filter(p => p.id !== id);
        localStorage.setItem('projects', JSON.stringify(updated));

        this.loadProjects();
      }
       
    });
  }

  //  REFRESH
  refresh() {
    this.loadProjects();
  }
}