# Reactive User Manager

A standalone Angular app demonstrating Signals, RxJS, signal-based component
inputs/outputs, and CRUD operations using the Beeceptor users API.

## Run the app

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Features

- Fetches users from Beeceptor only after the user selects **Load users**; it does not make
  an initial GET or display sample users. Username search filters the fetched list reactively.
- Creates users with POST, selects up to five users and fetches details on selection,
  updates users with PUT, and deletes users with DELETE.
- Uses signals for UI state and `async` pipe for observable list subscriptions.
- Uses RxJS operators for debounced search, request cancellation, and loading/error
  handling.

Successful create, update, and delete requests trigger a fresh GET so the displayed
user list reflects the API response.

## Check the app

```bash
npm test -- --watch=false
npm run build
```
