export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  company: {
    department?: string;
    title: string;
  };
  age?: number;
  address?: {
    address: string;
    city: string;
    state: string;
  };
}


// Pick allows you to select only the properties
//  you need from an existing type or interface
export type UserInput = Pick<
  User,
  'username' | 'firstName' | 'lastName' | 'email' | 'phone'
>; //creates a new type with 5 properties only from user

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number; // skipped in pagination
  limit: number; //max records returned
}
