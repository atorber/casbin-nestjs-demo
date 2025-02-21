/// <reference types="node" />

interface HelloWorldResponse {
  message: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}

interface UpdateUserRolesDto {
  roles: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Permission denied. You do not have access to this resource.');
    }
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

export async function getHelloWorld(): Promise<HelloWorldResponse> {
  const response = await fetch(`${API_BASE_URL}`);
  return handleResponse<HelloWorldResponse>(response);
}

export async function getAllUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<User[]>(response);
}

export async function getUser(token: string, id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<User>(response);
}

export async function updateUser(token: string, id: number, data: UpdateUserDto): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function updateUserRoles(token: string, id: number, data: UpdateUserRolesDto): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/roles`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function deleteUser(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<void>(response);
} 