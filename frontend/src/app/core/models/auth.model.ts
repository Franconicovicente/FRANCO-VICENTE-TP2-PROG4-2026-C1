import { User } from './user.model';
 
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}
 
export interface LoginDto {
  loginField: string; 
  password: string;
}
 
export interface AuthResponse {
  token: string;
  user: User;
}
 