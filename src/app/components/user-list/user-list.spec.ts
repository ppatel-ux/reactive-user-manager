import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserList } from './user-list';

describe('UserList', () => {
  const users: User[] = Array.from({ length: 6 }, (_, index) => ({
    id: `user-${index + 1}`,
    username: `person${index + 1}`,
    firstName: `First${index + 1}`,
    lastName: `Last${index + 1}`,
    email: `person${index + 1}@example.com`,
    phone: '555-0100',
    image: '',
    company: { title: 'Developer' },
  }));
  const userService = {
    getUsers: vi.fn(() => of(users)),
    getUserDetails: vi.fn((id: string) => of(users.find((user) => user.id === id)!)),
    createUser: vi.fn((input: Partial<User>) =>
      of({ ...users[0], ...input, id: 'user-7' }),
    ),
    updateUser: vi.fn((id: string, changes: Partial<User>) =>
      of({ ...users.find((user) => user.id === id)!, ...changes }),
    ),
    deleteUser: vi.fn(() => of(void 0)),
  };

  let component: UserList;
  let fixture: ComponentFixture<UserList>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not fetch users on init and searches after an explicit load', async () => {
    expect(userService.getUsers).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Load users');

    component.loadUsers();
    fixture.detectChanges();

    expect(userService.getUsers).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('@person1');

    const search = fixture.nativeElement.querySelector(
      '#user-search',
    ) as HTMLInputElement;
    search.value = 'person2';
    search.dispatchEvent(new Event('input'));
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(userService.getUsers).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('@person2');
    expect(fixture.nativeElement.textContent).not.toContain('@person1');
  });

  it('shows no sample records when the API returns an empty list', () => {
    userService.getUsers.mockReturnValueOnce(of([]));

    component.loadUsers();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No users are available.');
    expect(fixture.nativeElement.textContent).not.toContain('@alex.morgan');
  });

  it('loads details for selected users and caps the selection at five', () => {
    component.loadUsers();
    fixture.detectChanges();
    users.slice(0, 5).forEach((user) => {
      component.toggleSelection(user, { target: { checked: true } } as unknown as Event);
    });
    component.toggleSelection(users[5], { target: { checked: true } } as unknown as Event);

    expect(userService.getUserDetails).toHaveBeenCalledTimes(5);
    expect(component.selectedUsers()).toHaveLength(5);
    expect(component.selectedIds()).toHaveLength(5);
    expect(component.errorMessage()).toContain('up to five');
  });

  it('keeps list fields when the details response is partial', () => {
    userService.getUserDetails.mockReturnValueOnce(
      of({ id: users[0].id, email: 'updated@example.com' } as User),
    );

    component.toggleSelection(users[0], { target: { checked: true } } as unknown as Event);

    expect(component.selectedUsers()[0]).toMatchObject({
      firstName: users[0].firstName,
      lastName: users[0].lastName,
      username: users[0].username,
      email: 'updated@example.com',
    });
  });

  it('saves edits through the API and refreshes the user list', () => {
    component.loadUsers();
    fixture.detectChanges();
    component.toggleSelection(users[0], { target: { checked: true } } as unknown as Event);
    component.saveUser(users[0], { ...users[0], email: 'updated@example.com' });

    expect(userService.updateUser).toHaveBeenCalledWith(
      users[0].id,
      expect.objectContaining({ email: 'updated@example.com' }),
    );
    expect(component.selectedUsers()[0].email).toBe('updated@example.com');
    expect(component.successMessage()).toContain('saved');
    expect(userService.getUsers).toHaveBeenCalledTimes(2);
  });

  it('creates users through the API and reloads the list', () => {
    component.createForm.setValue({
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      phone: '',
    });

    component.createUser();
    fixture.detectChanges();

    expect(userService.createUser).toHaveBeenCalledWith({
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      phone: '',
    });
    expect(userService.getUsers).toHaveBeenCalledTimes(1);
    expect(component.successMessage()).toContain('created');
  });

  it('deletes users through the API and removes their selected card', () => {
    component.loadUsers();
    fixture.detectChanges();
    component.toggleSelection(users[0], { target: { checked: true } } as unknown as Event);

    component.deleteUser(users[0]);

    expect(userService.deleteUser).toHaveBeenCalledWith(users[0].id);
    expect(component.selectedUsers()).toHaveLength(0);
    expect(userService.getUsers).toHaveBeenCalledTimes(2);
    expect(component.successMessage()).toContain('deleted');
  });

  it('removes a selected user card', () => {
    component.loadUsers();
    fixture.detectChanges();
    component.toggleSelection(users[0], { target: { checked: true } } as unknown as Event);
    component.removeUser(users[0].id);

    expect(component.selectedUsers()).toHaveLength(0);
    expect(component.selectedIds()).toHaveLength(0);
  });
});
