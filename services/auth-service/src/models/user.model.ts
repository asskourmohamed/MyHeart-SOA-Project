export interface IUser {
  id: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin' | 'nurse';
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  id!: string;
  email!: string;
  password!: string;
  role!: 'patient' | 'doctor' | 'admin' | 'nurse';
  firstName!: string;
  lastName!: string;
  createdAt!: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser>) {
    Object.assign(this, data);
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }
}

// DTOs (Data Transfer Objects)
export interface CreateUserDTO {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin' | 'nurse';
  firstName: string;
  lastName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<IUser, 'password'>;
}