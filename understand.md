# Understanding the Reactive User Manager

## Data flow

`UserService` makes HTTP requests to the configured Beeceptor users endpoint and
returns Observables. The
`UserList` component creates the user stream in `ngOnInit`; `switchMap` starts a
new request when the debounced username changes and cancels an older search.
The `async` pipe displays the results and automatically unsubscribes with the
view.

Signals hold UI state that changes directly from user actions: selected IDs,
loaded user details, pending requests, and feedback messages. Selecting a user
requests their details, and each card receives its user with `input()` and sends
edit, save, and remove events with `output()`.

## API behavior

- The initial list and every successful mutation call the users endpoint with GET.
- Username search filters the latest fetched response reactively.
- Creating a user sends POST to the users endpoint.
- Selecting a user calls `/users/{id}` for the full details.
- Saving a card sends a PUT request to `/users/{id}`.
- Deleting a selected user sends DELETE to `/users/{id}`.
- `catchError` displays request failures and `finalize` clears loading states.
- After successful changes, the list is fetched again from the API.

Run the app with `npm start`; verify it with `npm test -- --watch=false` and
`npm run build`.
