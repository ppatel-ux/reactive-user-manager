import { User } from './user.model';

export interface UsersResponse {
  //wrapper object returned by all users and search apis
  //use wrapper obj so that  can add new metadata later without breaking existing code
  users: User[]; //array of user objects
  total: number; //total number of users--To build a page with pagination or infinite scroll
  skip: number; //number of users to skip -- where to fetch next set of users
  limit: number; //maximum number of users to return
}
