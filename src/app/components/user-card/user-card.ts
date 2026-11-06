import { Component, input, output, signal } from '@angular/core';
import { User, UserInput } from '../../models/user.model';

@Component({
  standalone: true,
  selector: 'app-user-card',
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  //inputs are the values that are passed into the component -child from the parent component. 
  // Outputs are the events that are emitted from the component-child to the parent component.
  readonly user = input.required<User>(); //this.user() - holds value
  readonly saving = input(false);
  readonly editing = input(false);
  readonly save = output<UserInput>(); //5 fields
  readonly edit = output<string>(); //user ID
  readonly cancel = output<void>(); 
  readonly remove = output<string>(); //user ID - select/deselect card
  readonly delete = output<void>();

  readonly draft = signal<UserInput>({ //this.draft() - holds value
    //holds users editable fields - 5 fields
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  startEditing(): void {
    const user = this.user();
    this.draft.set({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
    this.edit.emit(user.id);
  }

  updateField(field: keyof UserInput, event: Event): void { //key must be from
    const input = event.target as HTMLInputElement;
    this.draft.update((draft) => ({ ...draft, [field]: input.value }));
  }

  saveChanges(): void {
    this.save.emit(this.draft());
  }
}
