import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { User, UserInput } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserCard } from '../user-card/user-card';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UserCard],
  selector: 'app-user-list',
  styleUrl: './user-list.scss',
  templateUrl: './user-list.html',
})
export class UserList {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly searchText = signal('');
  readonly filteredUsers = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    return term
      ? this.users().filter((user) => user.username.toLowerCase().includes(term))
      : this.users();
  });
  readonly selectedIds = signal<string[]>([]);
  readonly selectedUsers = signal<User[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly loadingDetails = signal<ReadonlySet<string>>(new Set());
  readonly pendingUserIds = signal<ReadonlySet<string>>(new Set());
  readonly creating = signal(false);
  readonly loadingUsers = signal(false);
  readonly hasRequestedUsers = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly createForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true }),
  });

  loadUsers(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.hasRequestedUsers.set(true);
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.loadingUsers.set(true);
    this.userService
      .getUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingUsers.set(false)),
      )
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.errorMessage.set('');
        },
        error: () => {
          this.users.set([]);
          this.errorMessage.set("Couldn't load users. Check your connection and try again.");
        },
      });
  }

  onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  createUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.creating.set(true);

    this.userService
      .createUser(this.createForm.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.creating.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.createForm.reset();
          this.successMessage.set(`User @${user.username} was created.`);
          this.hasRequestedUsers.set(true);
          this.fetchUsers();
        },
        error: () => {
          this.errorMessage.set("Couldn't create user. Please try again.");
        },
      });
  }

  toggleSelection(user: User, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (!checked) {
      this.selectedIds.update((ids) => ids.filter((id) => id !== user.id));
      this.selectedUsers.update((users) => users.filter((item) => item.id !== user.id));
      return;
    }

    if (this.selectedIds().length >= 5) {
      this.errorMessage.set('You can select up to five users.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedIds.update((ids) => [...ids, user.id]);
    this.loadingDetails.update((ids) => new Set(ids).add(user.id));

    this.userService
      .getUserDetails(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loadingDetails.update((ids) => {
            const updated = new Set(ids);
            updated.delete(user.id);
            return updated;
          });
        }),
      )
      .subscribe({
        next: (details) => {
          if (!this.isSelected(user.id)) {
            return;
          }

          const completeUser = { ...user, ...details };
          this.selectedUsers.update((users) =>
            users.some((item) => item.id === user.id)
              ? users.map((item) => (item.id === user.id ? completeUser : item))
              : [...users, completeUser],
          );
        },
        error: () => {
          this.errorMessage.set(`Couldn't load details for @${user.username}.`);
          this.selectedIds.update((ids) => ids.filter((id) => id !== user.id));
        },
      });
  }

  editUser(id: string): void {
    this.editingId.set(id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  removeUser(id: string): void {
    this.selectedIds.update((ids) => ids.filter((item) => item !== id));
    this.selectedUsers.update((users) => users.filter((user) => user.id !== id));

    if (this.editingId() === id) {
      this.cancelEdit();
    }
  }

  deleteUser(user: User): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.pendingUserIds.update((ids) => new Set(ids).add(user.id));

    this.userService
      .deleteUser(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pendingUserIds.update((ids) => {
            const updated = new Set(ids);
            updated.delete(user.id);
            return updated;
          });
        }),
      )
      .subscribe({
        next: () => {
          this.removeUser(user.id);
          this.successMessage.set(`@${user.username} was deleted.`);
          this.fetchUsers();
        },
        error: () => {
          this.errorMessage.set(`Couldn't delete @${user.username}. Please try again.`);
        },
      });
  }

  saveUser(user: User, changes: UserInput): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.pendingUserIds.update((ids) => new Set(ids).add(user.id));

    this.userService
      .updateUser(user.id, changes)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pendingUserIds.update((ids) => {
            const updated = new Set(ids);
            updated.delete(user.id);
            return updated;
          });
        }),
      )
      .subscribe({
        next: (updatedUser) => {
          this.selectedUsers.update((users) =>
            users.map((item) =>
              item.id === user.id ? { ...item, ...updatedUser } : item,
            ),
          );
          this.cancelEdit();
          this.successMessage.set(`Changes for @${updatedUser.username} were saved.`);
          this.fetchUsers();
        },
        error: () => {
          this.errorMessage.set(`Couldn't save changes for @${user.username}. Please try again.`);
        },
      });
  }
}
