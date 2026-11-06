import { Component } from '@angular/core';
import { UserList } from './components/user-list/user-list';

@Component({
  standalone: true,
  imports: [UserList],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
