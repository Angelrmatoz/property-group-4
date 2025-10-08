// DTO para autenticación (register / login / user)

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admin?: boolean;
}
