import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RouterModule, Router } from '@angular/router';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    RouterModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, AfterViewInit {

  constructor(private router: Router) {}

  displayedColumns: string[] = [
    'sno',
    'ticket',
    'description',
    'project',
    'shift',
    'assignedBy',
    'effort',
    'date',
    'actions'
  ];

  tasks: any[] = [];
  dataSource = new MatTableDataSource<any>();

  searchText = '';
  selectedDate = '';
  selectedProject = '';
  sortOption = '';

  // POPUP
  showPopup = false;
  selectedTask: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  //  SORT FUNCTION 
  sortTasksByLatest() {
    this.tasks.sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // LOAD DATA
  loadTasks() {
    const data = localStorage.getItem('tasks');
    this.tasks = data ? JSON.parse(data) : [];

    this.sortTasksByLatest(); 

    this.dataSource.data = this.tasks;
  }

  // FILTER + SORT
  applyFilter() {
    let data = [...this.tasks];

    // SEARCH
    if (this.searchText) {
      data = data.filter(t =>
        t.ticket.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // DATE FILTER
    if (this.selectedDate) {
      data = data.filter(t =>
        new Date(t.date).toISOString().split('T')[0] === this.selectedDate
      );
    }

    // PROJECT FILTER
    if (this.selectedProject) {
      data = data.filter(t =>
        t.project.toLowerCase().includes(this.selectedProject.toLowerCase())
      );
    }

    // DEFAULT SORT (LATEST FIRST)
    data.sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // OPTIONAL CUSTOM SORT
    switch (this.sortOption) {
      case 'ticket-asc':
        data.sort((a, b) => a.ticket.localeCompare(b.ticket));
        break;
      case 'ticket-desc':
        data.sort((a, b) => b.ticket.localeCompare(a.ticket));
        break;
      case 'project-asc':
        data.sort((a, b) => a.project.localeCompare(b.project));
        break;
      case 'project-desc':
        data.sort((a, b) => b.project.localeCompare(a.project));
        break;
    }

    this.dataSource.data = data;
  }

  // VIEW
  viewTask(t: any) {
    this.selectedTask = t;
    this.showPopup = true;
  }

  // CLOSE POPUP
  closePopup() {
    this.showPopup = false;
  }

  // 
  editTask(t: any) {
    this.router.navigate(['/add-task'], {
      queryParams: { id: t.id }
    });
  }

  // DELETE
  deleteTask(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This task will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete it'
    }).then(result => {

      if (result.isConfirmed) {

        this.tasks = this.tasks.filter(t => t.id !== id);

        this.sortTasksByLatest(); 

        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.dataSource.data = this.tasks;

        Swal.fire('Deleted!', 'Task removed successfully', 'success');
      }

    });
  }

  // REFRESH
  refresh() {
    this.loadTasks();
  }
}
