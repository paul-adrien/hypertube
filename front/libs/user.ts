export interface User {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  userName: string;
  picture: string;
  lang: string;
}

export function mapUserBackToUserFront(user: any): Partial<User> {
  return {
    id: user['id'],
    userName: user['userName'],
    firstName: user['firstName'],
    lastName: user['lastName'],
    email: user['email'],
    picture: user['picture'],
    lang: user['lang'],
  };
}
