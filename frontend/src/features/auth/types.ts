export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}
export interface LoginValues {
  usernameOrEmail: string;
  password: string;
}
export interface RegisterValues {
  username: string;
  email: string;
  password: string;
}
