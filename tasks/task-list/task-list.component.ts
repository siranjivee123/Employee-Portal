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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // Load data
  loadTasks() {
    const data = localStorage.getItem('tasks');
    this.tasks = data ? JSON.parse(data) : [];
    this.tasks = this.tasks.reverse();
    this.dataSource.data = this.tasks;
  }

  // Filter + Sort
  applyFilter() {
    let data = [...this.tasks];

    if (this.searchText) {
      data = data.filter(t =>
        t.ticket.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.selectedDate) {
      data = data.filter(t => t.date === this.selectedDate);
    }

    if (this.selectedProject) {
      data = data.filter(t =>
        t.project.toLowerCase().includes(this.selectedProject.toLowerCase())
      );
    }

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

  // View
  viewTask(t: any) {
    Swal.fire({
      title: 'Task Details',
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.8">
          <table style="width:100%">
            <tr><td><b>Ticket</b></td><td>: ${t.ticket}</td></tr>
            <tr><td><b>Description</b></td><td>: ${t.description}</td></tr>
            <tr><td><b>Project</b></td><td>: ${t.project}</td></tr>
            <tr><td><b>Shift</b></td><td>: ${t.shift}</td></tr>
            <tr><td><b>Assigned By</b></td><td>: ${t.assignedBy}</td></tr>
            <tr><td><b>Effort</b></td><td>: ${t.effort} hrs</td></tr>
            <tr><td><b>Date</b></td><td>: ${new Date(t.date).toLocaleDateString()}</td></tr>
          </table>
        </div>
      `,
      icon: 'info',
      width: '450px',
      confirmButtonText: 'Close'
    });
  }

  //  Edit
  editTask(t: any) {
    this.router.navigate(['/add-task'], {
      queryParams: { id: t.id }
    });
  }

  // Delete 
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
        localStorage.setItem('tasks', JSON.stringify(this.tasks));

        this.dataSource.data = this.tasks;

        Swal.fire('Deleted!', 'Task removed successfully', 'success');
      }

    });
  }

  // Refresh
  refresh() {
    this.loadTasks();
  }
}