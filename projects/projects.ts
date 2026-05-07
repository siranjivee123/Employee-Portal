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
    'sno',
    'name',
    'description',
    'category',
    'manager',
    'employees',
    'date',
    'actions'
  ];

  projects: any[] = [];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  selectedCategory = '';
  selectedDate = '';
  sortOption: string = '';

   // POPUP VARIABLES
  showPopup = false;
  selectedProject: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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

 // SEARCH FIlter:
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
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
  }

  //  VIEW
   viewProject(p: any) {
    this.selectedProject = p;
    this.showPopup = true;
  }

  // CLOSE POPUP
  closePopup() {
    this.showPopup = false;
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
