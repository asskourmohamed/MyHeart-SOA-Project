import { users, User } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    return users.find(user => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return users.find(user => user.id === id);
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date()
    };
    return users[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    users.splice(index, 1);
    return true;
  }

  async findAll(): Promise<User[]> {
    return users;
  }
}