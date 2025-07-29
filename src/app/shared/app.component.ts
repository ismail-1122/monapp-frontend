import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../core/services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 style="text-align:center;">Liste des Utilisateurs</h1>
    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
      <form (ngSubmit)="addUser()" #userForm="ngForm" style="display: flex; gap: 10px;">
        <input name="name" [(ngModel)]="newUser.name" placeholder="Nom" required style="padding: 5px;" />
        <input name="email" [(ngModel)]="newUser.email" placeholder="Email" required style="padding: 5px;" />
        <button type="submit" [disabled]="!userForm.form.valid" style="padding: 5px 10px;">Ajouter</button>
      </form>
    </div>
    <div style="display: flex; justify-content: center;">
      <table style="border-collapse: collapse; min-width: 400px; text-align: center;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">ID</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Nom</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td style="border: 1px solid #ccc; padding: 8px; color: #1976d2; font-weight: bold;">{{ user.id }}</td>
            <td style="border: 1px solid #ccc; padding: 8px; color: #388e3c; font-weight: bold;">{{ user.name }}</td>
            <td style="border: 1px solid #ccc; padding: 8px; color: #d32f2f; font-weight: bold;">{{ user.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['../app.css']
})
export class AppComponent implements OnInit {
  users: any[] = [];
  newUser = { name: '', email: '' };

  constructor(private userService: UserService) {
    console.log('AppComponent constructed');
  }

  ngOnInit() {
    console.log('ngOnInit called');
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      console.log('Users loaded:', data);
    }, error => {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    });
  }

  addUser() {
    if (!this.newUser.name || !this.newUser.email) return;
    this.userService.addUser(this.newUser).subscribe(user => {
      this.newUser = { name: '', email: '' };
      // Refresh the user list from the backend after adding
      this.userService.getUsers().subscribe(data => {
        this.users = data;
      });
    });
  }
}
