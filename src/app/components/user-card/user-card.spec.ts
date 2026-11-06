import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User } from '../../models/user.model';
import { UserCard } from './user-card';

describe('UserCard', () => {
  const user: User = {
    id: 'user-1',
    username: 'janedoe',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '555-0100',
    image: '',
    company: { title: 'Developer' },
  };

  let fixture: ComponentFixture<UserCard>;
  let component: UserCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', user);
    fixture.detectChanges();
  });

  it('displays details and emits the remove action', () => {
    const removeSpy = vi.fn();
    component.remove.subscribe(removeSpy);

    expect(fixture.nativeElement.textContent).toContain('jane@example.com');
    fixture.nativeElement.querySelector('.remove-button').click();

    expect(removeSpy).toHaveBeenCalledWith(user.id);
  });

  it('uses signal inputs and outputs for editing a user', () => {
    const editSpy = vi.fn();
    const saveSpy = vi.fn();
    component.edit.subscribe(editSpy);
    component.save.subscribe(saveSpy);

    component.startEditing();
    component.draft.update((draft) => ({ ...draft, email: 'new@example.com' }));
    component.saveChanges();

    expect(editSpy).toHaveBeenCalledWith(user.id);
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com' }),
    );
  });
});
