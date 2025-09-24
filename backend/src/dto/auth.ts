// DTO para autenticación (register / login / user)

export interface RegisterDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}
